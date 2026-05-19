import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../components/atoms/Button/Button';
import Modal from '../../components/atoms/Modal/Modal';
import { useDisclosure } from '../../hooks/useDisclosure';
import { apiClient } from '../../lib/apiClient';
import styles from './InventoryPage.module.css';

interface InventoryItem {
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
}

const itemSchema = z.object({
  name: z.string().min(1, 'Name required'),
  category: z.string().min(1, 'Category required'),
  lot_number: z.string().optional(),
  quantity: z.coerce.number().min(0, 'Must be ≥ 0'),
  unit: z.string().min(1, 'Unit required'),
  min_quantity: z.coerce.number().min(0, 'Must be ≥ 0'),
  expiration_date: z.string().optional(),
  supplier: z.string().optional(),
  description: z.string().optional(),
});
type ItemForm = z.infer<typeof itemSchema>;

const CATEGORIES = ['reagent', 'consumable', 'equipment', 'media', 'chemical', 'kit', 'other'];

function stockWarning(item: InventoryItem): 'low' | 'expiring' | 'expired' | null {
  const now = new Date();
  if (item.expiration_date) {
    const exp = new Date(item.expiration_date);
    if (exp <= now) return 'expired';
    const daysLeft = (exp.getTime() - now.getTime()) / 86_400_000;
    if (daysLeft <= 30) return 'expiring';
  }
  if (item.min_quantity > 0 && item.quantity <= item.min_quantity) return 'low';
  return null;
}

const InventoryPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const newModal = useDisclosure();
  const [createError, setCreateError] = useState('');

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: () => apiClient.get('inventory').json<InventoryItem[]>(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: { quantity: 0, min_quantity: 0 },
  });

  const createMutation = useMutation({
    mutationFn: (body: ItemForm) =>
      apiClient.post('inventory', {
        json: {
          ...body,
          lot_number: body.lot_number || null,
          expiration_date: body.expiration_date ? new Date(body.expiration_date).toISOString() : null,
          supplier: body.supplier || null,
          description: body.description || null,
        },
      }).json<InventoryItem>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      reset();
      newModal.close();
      setCreateError('');
    },
    onError: () => setCreateError('Failed to create item. Lot number may already exist.'),
  });

  if (isLoading) return <div className={styles.page}><p>Loading…</p></div>;

  const lowCount = items.filter(i => stockWarning(i) === 'low').length;
  const expiringCount = items.filter(i => stockWarning(i) === 'expiring').length;
  const expiredCount = items.filter(i => stockWarning(i) === 'expired').length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Inventory</h1>
        <Button onClick={newModal.open}>+ New Item</Button>
      </div>

      {(lowCount > 0 || expiringCount > 0 || expiredCount > 0) && (
        <div className={styles.alerts}>
          {expiredCount > 0 && <span className={styles.alertExpired}>{expiredCount} expired</span>}
          {expiringCount > 0 && <span className={styles.alertExpiring}>{expiringCount} expiring soon</span>}
          {lowCount > 0 && <span className={styles.alertLow}>{lowCount} low stock</span>}
        </div>
      )}

      {items.length === 0 ? (
        <p className={styles.empty}>No inventory items yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Lot #</th>
              <th>Qty / Unit</th>
              <th>Min</th>
              <th>Expires</th>
              <th>Supplier</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const warn = stockWarning(item);
              return (
                <tr key={item.id} className={styles.row} onClick={() => navigate(`/inventory/${item.id}`)}>
                  <td className={styles.name}>{item.name}</td>
                  <td className={styles.cap}>{item.category}</td>
                  <td className={styles.mono}>{item.lot_number ?? '—'}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td>{item.min_quantity}</td>
                  <td>{item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : '—'}</td>
                  <td>{item.supplier ?? '—'}</td>
                  <td>
                    {warn === 'expired' && <span className={styles.badgeExpired}>Expired</span>}
                    {warn === 'expiring' && <span className={styles.badgeExpiring}>Expiring</span>}
                    {warn === 'low' && <span className={styles.badgeLow}>Low</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {newModal.isOpen && (
        <Modal
          header="New Inventory Item"
          closeModal={newModal.close}
          height="580px"
          modalContent={
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className={styles.form}>
              <label className={styles.label}>
                Name *
                <input className={styles.input} {...register('name')} autoFocus />
                {errors.name && <span className={styles.error}>{errors.name.message}</span>}
              </label>
              <label className={styles.label}>
                Category *
                <select className={styles.input} {...register('category')}>
                  <option value="">Select…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <span className={styles.error}>{errors.category.message}</span>}
              </label>
              <div className={styles.row2}>
                <label className={styles.label}>
                  Initial Qty *
                  <input className={styles.input} type="number" step="any" min="0" {...register('quantity')} />
                  {errors.quantity && <span className={styles.error}>{errors.quantity.message}</span>}
                </label>
                <label className={styles.label}>
                  Unit *
                  <input className={styles.input} placeholder="mL, units, boxes…" {...register('unit')} />
                  {errors.unit && <span className={styles.error}>{errors.unit.message}</span>}
                </label>
              </div>
              <label className={styles.label}>
                Min Qty (alert threshold)
                <input className={styles.input} type="number" step="any" min="0" {...register('min_quantity')} />
              </label>
              <label className={styles.label}>
                Lot Number
                <input className={styles.input} {...register('lot_number')} />
              </label>
              <label className={styles.label}>
                Expiration Date
                <input className={styles.input} type="date" {...register('expiration_date')} />
              </label>
              <label className={styles.label}>
                Supplier
                <input className={styles.input} {...register('supplier')} />
              </label>
              {createError && <p className={styles.error}>{createError}</p>}
              <div className={styles.actions}>
                <Button type="button" variant="cancel" onClick={newModal.close}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>Create</Button>
              </div>
            </form>
          }
        />
      )}
    </div>
  );
};

export default InventoryPage;
