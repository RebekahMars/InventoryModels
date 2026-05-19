import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../components/atoms/Button/Button';
import Modal from '../../components/atoms/Modal/Modal';
import StatusBadge from '../../components/atoms/StatusBadge/StatusBadge';
import { useDisclosure } from '../../hooks/useDisclosure';
import { apiClient } from '../../lib/apiClient';
import styles from './SamplesPage.module.css';

interface Sample {
  id: string;
  barcode: string;
  sample_type: string;
  status: string;
  collected_at: string | null;
  collected_by: string | null;
  donor_id: string | null;
  notes: string | null;
  created_at: string;
}

const schema = z.object({
  barcode: z.string().min(1, 'Barcode required'),
  sample_type: z.string().min(1, 'Type required'),
  collected_by: z.string().optional(),
  donor_id: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const SamplesPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const modal = useDisclosure();
  const [serverError, setServerError] = useState('');

  const { data: samples = [], isLoading } = useQuery<Sample[]>({
    queryKey: ['samples'],
    queryFn: () => apiClient.get('samples').json<Sample[]>(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (body: FormData) => apiClient.post('samples', { json: body }).json<Sample>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['samples'] });
      reset();
      modal.close();
      setServerError('');
    },
    onError: () => setServerError('Failed to create sample. Barcode may already exist.'),
  });

  const onSubmit = (data: FormData) => {
    setServerError('');
    createMutation.mutate(data);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Samples</h1>
        <Button onClick={modal.open}>+ New Sample</Button>
      </div>

      {isLoading ? (
        <p className={styles.empty}>Loading…</p>
      ) : samples.length === 0 ? (
        <p className={styles.empty}>No samples yet. Create one to get started.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Type</th>
              <th>Status</th>
              <th>Collected By</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.id} className={styles.row} onClick={() => navigate(`/samples/${s.id}`)}>
                <td className={styles.mono}>{s.barcode}</td>
                <td>{s.sample_type}</td>
                <td><StatusBadge status={s.status} /></td>
                <td>{s.collected_by ?? '—'}</td>
                <td>{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal.isOpen && (
        <Modal
          header="New Sample"
          closeModal={modal.close}
          height="560px"
          modalContent={
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <label className={styles.label}>
                Barcode *
                <input className={styles.input} {...register('barcode')} autoFocus />
                {errors.barcode && <span className={styles.error}>{errors.barcode.message}</span>}
              </label>
              <label className={styles.label}>
                Sample Type *
                <input className={styles.input} placeholder="blood, tissue, swab…" {...register('sample_type')} />
                {errors.sample_type && <span className={styles.error}>{errors.sample_type.message}</span>}
              </label>
              <label className={styles.label}>
                Collected By
                <input className={styles.input} {...register('collected_by')} />
              </label>
              <label className={styles.label}>
                Donor ID
                <input className={styles.input} {...register('donor_id')} />
              </label>
              <label className={styles.label}>
                Notes
                <textarea className={styles.input} rows={3} {...register('notes')} />
              </label>
              {serverError && <p className={styles.error}>{serverError}</p>}
              <div className={styles.actions}>
                <Button type="button" variant="cancel" onClick={modal.close}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>Create</Button>
              </div>
            </form>
          }
        />
      )}
    </div>
  );
};

export default SamplesPage;
