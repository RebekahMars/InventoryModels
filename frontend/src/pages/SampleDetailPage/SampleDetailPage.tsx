import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../components/atoms/Button/Button';
import Modal from '../../components/atoms/Modal/Modal';
import StatusBadge from '../../components/atoms/StatusBadge/StatusBadge';
import { useDisclosure } from '../../hooks/useDisclosure';
import { apiClient } from '../../lib/apiClient';
import styles from './SampleDetailPage.module.css';

interface Aliquot {
  id: string;
  barcode: string;
  volume_ul: number | null;
  notes: string | null;
  container_id: string | null;
  created_at: string;
}

interface SampleDetail {
  id: string;
  barcode: string;
  sample_type: string;
  status: string;
  collected_at: string | null;
  collected_by: string | null;
  donor_id: string | null;
  notes: string | null;
  created_at: string;
  aliquots: Aliquot[];
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  received:   ['processing', 'disposed'],
  processing: ['stored', 'disposed'],
  stored:     ['disposed'],
  disposed:   [],
};

const aliquotSchema = z.object({
  barcode: z.string().min(1, 'Barcode required'),
  volume_ul: z.coerce.number().positive().optional().or(z.literal('')),
  notes: z.string().optional(),
});
type AliquotForm = z.infer<typeof aliquotSchema>;

const SampleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const aliquotModal = useDisclosure();
  const [aliquotError, setAliquotError] = useState('');

  const { data: sample, isLoading } = useQuery<SampleDetail>({
    queryKey: ['samples', id],
    queryFn: () => apiClient.get(`samples/${id}`).json<SampleDetail>(),
    enabled: !!id,
  });

  const transitionMutation = useMutation({
    mutationFn: (status: string) =>
      apiClient.patch(`samples/${id}/status`, { json: { status } }).json<SampleDetail>(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['samples', id] }),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AliquotForm>({
    resolver: zodResolver(aliquotSchema),
  });

  const aliquotMutation = useMutation({
    mutationFn: (body: AliquotForm) =>
      apiClient.post(`samples/${id}/aliquots`, {
        json: { ...body, volume_ul: body.volume_ul === '' ? null : body.volume_ul },
      }).json<Aliquot>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['samples', id] });
      reset();
      aliquotModal.close();
      setAliquotError('');
    },
    onError: () => setAliquotError('Failed to create aliquot. Barcode may already exist.'),
  });

  if (isLoading) return <div className={styles.page}><p>Loading…</p></div>;
  if (!sample) return <div className={styles.page}><p>Sample not found.</p></div>;

  const nextStatuses = VALID_TRANSITIONS[sample.status] ?? [];

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/samples')}>
        ← Samples
      </button>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h1 className={styles.heading}>{sample.barcode}</h1>
            <p className={styles.sub}>{sample.sample_type}</p>
          </div>
          <StatusBadge status={sample.status} />
        </div>

        <dl className={styles.meta}>
          {sample.collected_by && <><dt>Collected by</dt><dd>{sample.collected_by}</dd></>}
          {sample.donor_id && <><dt>Donor ID</dt><dd>{sample.donor_id}</dd></>}
          {sample.collected_at && <><dt>Collected at</dt><dd>{new Date(sample.collected_at).toLocaleString()}</dd></>}
          {sample.notes && <><dt>Notes</dt><dd>{sample.notes}</dd></>}
          <dt>Created</dt><dd>{new Date(sample.created_at).toLocaleString()}</dd>
        </dl>

        {nextStatuses.length > 0 && (
          <div className={styles.transitions}>
            <span className={styles.transLabel}>Transition to:</span>
            {nextStatuses.map((s) => (
              <button
                key={s}
                type="button"
                className={styles.transBtn}
                onClick={() => transitionMutation.mutate(s)}
                disabled={transitionMutation.isPending}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Aliquots ({sample.aliquots.length})</h2>
          <Button onClick={aliquotModal.open}>+ Add Aliquot</Button>
        </div>

        {sample.aliquots.length === 0 ? (
          <p className={styles.empty}>No aliquots yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Volume (µL)</th>
                <th>Notes</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {sample.aliquots.map((a) => (
                <tr key={a.id}>
                  <td className={styles.mono}>{a.barcode}</td>
                  <td>{a.volume_ul ?? '—'}</td>
                  <td>{a.notes ?? '—'}</td>
                  <td>{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {aliquotModal.isOpen && (
        <Modal
          header="Add Aliquot"
          closeModal={aliquotModal.close}
          height="360px"
          modalContent={
            <form onSubmit={handleSubmit((d) => aliquotMutation.mutate(d))} className={styles.form}>
              <label className={styles.label}>
                Barcode *
                <input className={styles.input} {...register('barcode')} autoFocus />
                {errors.barcode && <span className={styles.error}>{errors.barcode.message}</span>}
              </label>
              <label className={styles.label}>
                Volume (µL)
                <input className={styles.input} type="number" step="any" {...register('volume_ul')} />
              </label>
              <label className={styles.label}>
                Notes
                <textarea className={styles.input} rows={2} {...register('notes')} />
              </label>
              {aliquotError && <p className={styles.error}>{aliquotError}</p>}
              <div className={styles.actions}>
                <Button type="button" variant="cancel" onClick={aliquotModal.close}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>Add</Button>
              </div>
            </form>
          }
        />
      )}
    </div>
  );
};

export default SampleDetailPage;
