import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../components/atoms/Button/Button';
import Modal from '../../components/atoms/Modal/Modal';
import { useDisclosure } from '../../hooks/useDisclosure';
import { apiClient } from '../../lib/apiClient';
import styles from './ContainersPage.module.css';

interface Container {
  id: string;
  name: string;
  container_type: string;
  location: string | null;
  description: string | null;
  created_at: string;
}

const CONTAINER_TYPES = ['freezer', 'rack', 'box', 'cryotank', 'other'];

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  container_type: z.string().min(1, 'Type required'),
  location: z.string().optional(),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const ContainersPage = () => {
  const qc = useQueryClient();
  const modal = useDisclosure();
  const [serverError, setServerError] = useState('');

  const { data: containers = [], isLoading } = useQuery<Container[]>({
    queryKey: ['containers'],
    queryFn: () => apiClient.get('containers').json<Container[]>(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (body: FormData) => apiClient.post('containers', { json: body }).json<Container>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['containers'] });
      reset();
      modal.close();
      setServerError('');
    },
    onError: () => setServerError('Failed to create container.'),
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Containers</h1>
        <Button onClick={modal.open}>+ New Container</Button>
      </div>

      {isLoading ? (
        <p className={styles.empty}>Loading…</p>
      ) : containers.length === 0 ? (
        <p className={styles.empty}>No containers yet. Create one to get started.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Description</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {containers.map((c) => (
              <tr key={c.id}>
                <td className={styles.bold}>{c.name}</td>
                <td className={styles.capitalize}>{c.container_type}</td>
                <td>{c.location ?? '—'}</td>
                <td>{c.description ?? '—'}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal.isOpen && (
        <Modal
          header="New Container"
          closeModal={modal.close}
          height="420px"
          modalContent={
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className={styles.form}>
              <label className={styles.label}>
                Name *
                <input className={styles.input} {...register('name')} autoFocus />
                {errors.name && <span className={styles.error}>{errors.name.message}</span>}
              </label>
              <label className={styles.label}>
                Type *
                <select className={styles.input} {...register('container_type')}>
                  <option value="">Select…</option>
                  {CONTAINER_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.container_type && <span className={styles.error}>{errors.container_type.message}</span>}
              </label>
              <label className={styles.label}>
                Location
                <input className={styles.input} placeholder="e.g. Lab A, -80°C Freezer #2" {...register('location')} />
              </label>
              <label className={styles.label}>
                Description
                <textarea className={styles.input} rows={2} {...register('description')} />
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

export default ContainersPage;
