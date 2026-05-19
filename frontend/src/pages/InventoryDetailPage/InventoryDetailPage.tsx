import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../components/atoms/Button/Button';
import Modal from '../../components/atoms/Modal/Modal';
import { useDisclosure } from '../../hooks/useDisclosure';
import { apiClient } from '../../lib/apiClient';
import styles from './InventoryDetailPage.module.css';

interface Transaction {
  id: string;
  action: string;
  delta: number;
  quantity_after: number;
  actor: string;
  notes: string | null;
  created_at: string;
}

interface InventoryItemDetail {
  id: string;
  name: string;
  category: string;
  lot_number: string | null;
  quantity: number;
  unit: string;
  min_quantity: number;
  expiration_date: string | null;
  supplier: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  transactions: Transaction[];
}

const adjustSchema = z.object({
  action: z.enum(['restock', 'use', 'adjust', 'dispose']),
  delta: z.coerce.number().refine(v => v !== 0, 'Must be non-zero'),
  notes: z.string().optional(),
});
type AdjustForm = z.infer<typeof adjustSchema>;

const ACTION_COLORS: Record<string, string> = {
  restock: '#15803d',
  initial: '#15803d',
  use: '#c2410c',
  dispose: '#b91c1c',
  adjust: '#1d4ed8',
};

const InventoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const adjustModal = useDisclosure();
  const [adjustError, setAdjustError] = useState('');

  const { data: item, isLoading } = useQuery<InventoryItemDetail>({
    queryKey: ['inventory', id],
    queryFn: () => apiClient.get(`inventory/${id}`).json<InventoryItemDetail>(),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AdjustForm>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { action: 'restock' },
  });

  const adjustMutation = useMutation({
    mutationFn: (body: AdjustForm) =>
      apiClient.post(`inventory/${id}/adjust`, { json: body }).json<InventoryItemDetail>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory', id] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
      reset();
      adjustModal.close();
      setAdjustError('');
    },
    onError: (e: any) => {
      const msg = e?.response ? 'Adjustment would result in negative quantity.' : 'Failed to adjust stock.';
      setAdjustError(msg);
    },
  });

  if (isLoading) return <div className={styles.page}><p>Loading…</p></div>;
  if (!item) return <div className={styles.page}><p>Item not found.</p></div>;

  const isLow = item.min_quantity > 0 && item.quantity <= item.min_quantity;
  const isExpired = item.expiration_date && new Date(item.expiration_date) <= new Date();
  const isExpiring = !isExpired && item.expiration_date &&
    (new Date(item.expiration_date).getTime() - Date.now()) / 86_400_000 <= 30;

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/inventory')}>
        ← Inventory
      </button>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h1 className={styles.heading}>{item.name}</h1>
            <p className={styles.sub}>{item.category}</p>
          </div>
          <div className={styles.badges}>
            {isExpired && <span className={styles.badgeExpired}>Expired</span>}
            {isExpiring && <span className={styles.badgeExpiring}>Expiring Soon</span>}
            {isLow && <span className={styles.badgeLow}>Low Stock</span>}
          </div>
        </div>

        <div className={styles.qtyBlock}>
          <span className={`${styles.qty} ${isLow ? styles.qtyLow : ''}`}>{item.quantity}</span>
          <span className={styles.unit}>{item.unit}</span>
          {item.min_quantity > 0 && (
            <span className={styles.minLabel}>min: {item.min_quantity}</span>
          )}
        </div>

        <dl className={styles.meta}>
          {item.lot_number && <><dt>Lot #</dt><dd className={styles.mono}>{item.lot_number}</dd></>}
          {item.supplier && <><dt>Supplier</dt><dd>{item.supplier}</dd></>}
          {item.expiration_date && (
            <><dt>Expires</dt><dd>{new Date(item.expiration_date).toLocaleDateString()}</dd></>
          )}
          {item.description && <><dt>Description</dt><dd>{item.description}</dd></>}
          <dt>Created</dt><dd>{new Date(item.created_at).toLocaleString()}</dd>
        </dl>

        <div className={styles.adjustRow}>
          <Button onClick={adjustModal.open}>Adjust Stock</Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Transaction History ({item.transactions.length})</h2>

        {item.transactions.length === 0 ? (
          <p className={styles.empty}>No transactions recorded.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Delta</th>
                <th>Qty After</th>
                <th>Actor</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {item.transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.created_at).toLocaleString()}</td>
                  <td>
                    <span
                      className={styles.actionBadge}
                      style={{ color: ACTION_COLORS[t.action] ?? '#374151' }}
                    >
                      {t.action}
                    </span>
                  </td>
                  <td className={t.delta >= 0 ? styles.positive : styles.negative}>
                    {t.delta >= 0 ? '+' : ''}{t.delta}
                  </td>
                  <td>{t.quantity_after}</td>
                  <td className={styles.actor}>{t.actor}</td>
                  <td>{t.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {adjustModal.isOpen && (
        <Modal
          header="Adjust Stock"
          closeModal={adjustModal.close}
          height="340px"
          modalContent={
            <form onSubmit={handleSubmit((d) => adjustMutation.mutate(d))} className={styles.form}>
              <label className={styles.label}>
                Action *
                <select className={styles.input} {...register('action')}>
                  <option value="restock">Restock (add)</option>
                  <option value="use">Use (subtract)</option>
                  <option value="dispose">Dispose (subtract)</option>
                  <option value="adjust">Manual Adjust</option>
                </select>
              </label>
              <label className={styles.label}>
                Amount *
                <input className={styles.input} type="number" step="any" autoFocus {...register('delta')} />
                <span className={styles.hint}>Positive adds, negative subtracts</span>
                {errors.delta && <span className={styles.error}>{errors.delta.message}</span>}
              </label>
              <label className={styles.label}>
                Notes
                <input className={styles.input} {...register('notes')} />
              </label>
              {adjustError && <p className={styles.error}>{adjustError}</p>}
              <div className={styles.actions}>
                <Button type="button" variant="cancel" onClick={adjustModal.close}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>Apply</Button>
              </div>
            </form>
          }
        />
      )}
    </div>
  );
};

export default InventoryDetailPage;
