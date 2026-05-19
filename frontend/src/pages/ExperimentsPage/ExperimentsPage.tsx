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
import styles from './ExperimentsPage.module.css';

interface Experiment {
  id: string;
  title: string;
  protocol: string | null;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
}

const experimentSchema = z.object({
  title: z.string().min(1, 'Title required'),
  protocol: z.string().optional(),
  notes: z.string().optional(),
  started_at: z.string().optional(),
});
type ExperimentForm = z.infer<typeof experimentSchema>;

const ExperimentsPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const newModal = useDisclosure();
  const [createError, setCreateError] = useState('');

  const { data: experiments = [], isLoading } = useQuery<Experiment[]>({
    queryKey: ['experiments'],
    queryFn: () => apiClient.get('experiments').json<Experiment[]>(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ExperimentForm>({
    resolver: zodResolver(experimentSchema),
  });

  const createMutation = useMutation({
    mutationFn: (body: ExperimentForm) =>
      apiClient.post('experiments', {
        json: {
          ...body,
          protocol: body.protocol || null,
          notes: body.notes || null,
          started_at: body.started_at ? new Date(body.started_at).toISOString() : null,
        },
      }).json<Experiment>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['experiments'] });
      reset();
      newModal.close();
      setCreateError('');
    },
    onError: () => setCreateError('Failed to create experiment.'),
  });

  const statusCounts = experiments.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  if (isLoading) return <div className={styles.page}><p>Loading…</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Experiments</h1>
        <Button onClick={newModal.open}>+ New Experiment</Button>
      </div>

      {experiments.length > 0 && (
        <div className={styles.summary}>
          {Object.entries(statusCounts).map(([s, n]) => (
            <span key={s} className={styles.summaryItem}>
              <StatusBadge status={s} /> {n}
            </span>
          ))}
        </div>
      )}

      {experiments.length === 0 ? (
        <p className={styles.empty}>No experiments yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Started</th>
              <th>Completed</th>
              <th>Created by</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {experiments.map((e) => (
              <tr key={e.id} className={styles.row} onClick={() => navigate(`/experiments/${e.id}`)}>
                <td className={styles.title}>{e.title}</td>
                <td><StatusBadge status={e.status} /></td>
                <td>{e.started_at ? new Date(e.started_at).toLocaleDateString() : '—'}</td>
                <td>{e.completed_at ? new Date(e.completed_at).toLocaleDateString() : '—'}</td>
                <td className={styles.actor}>{e.created_by}</td>
                <td>{new Date(e.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {newModal.isOpen && (
        <Modal
          header="New Experiment"
          closeModal={newModal.close}
          height="440px"
          modalContent={
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className={styles.form}>
              <label className={styles.label}>
                Title *
                <input className={styles.input} {...register('title')} autoFocus />
                {errors.title && <span className={styles.error}>{errors.title.message}</span>}
              </label>
              <label className={styles.label}>
                Protocol / Method
                <textarea className={styles.input} rows={3} {...register('protocol')} />
              </label>
              <label className={styles.label}>
                Start Date
                <input className={styles.input} type="date" {...register('started_at')} />
              </label>
              <label className={styles.label}>
                Notes
                <textarea className={styles.input} rows={2} {...register('notes')} />
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

export default ExperimentsPage;
