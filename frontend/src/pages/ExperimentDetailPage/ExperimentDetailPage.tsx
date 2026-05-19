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
import styles from './ExperimentDetailPage.module.css';

interface SampleRef {
  id: string;
  barcode: string;
  sample_type: string;
  status: string;
}

interface ExperimentSample {
  id: string;
  sample_id: string;
  notes: string | null;
  added_at: string;
  sample: SampleRef;
}

interface ExperimentResult {
  id: string;
  analyte: string;
  value: string;
  unit: string | null;
  reference_range: string | null;
  interpretation: string;
  notes: string | null;
  recorded_by: string;
  recorded_at: string;
  sample_id: string | null;
}

interface ExperimentDetail {
  id: string;
  title: string;
  protocol: string | null;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  experiment_samples: ExperimentSample[];
  results: ExperimentResult[];
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft:     ['active', 'archived'],
  active:    ['completed', 'archived'],
  completed: ['archived'],
  archived:  [],
};

const addSampleSchema = z.object({
  sample_id: z.string().uuid('Enter a valid sample ID'),
  notes: z.string().optional(),
});
type AddSampleForm = z.infer<typeof addSampleSchema>;

const resultSchema = z.object({
  analyte: z.string().min(1, 'Analyte required'),
  value: z.string().min(1, 'Value required'),
  unit: z.string().optional(),
  reference_range: z.string().optional(),
  interpretation: z.enum(['normal', 'abnormal', 'inconclusive', 'pending']),
  notes: z.string().optional(),
  sample_id: z.string().optional(),
});
type ResultForm = z.infer<typeof resultSchema>;

const INTERP_COLORS: Record<string, string> = {
  normal: '#15803d',
  abnormal: '#b91c1c',
  inconclusive: '#92400e',
  pending: '#64748b',
};

const isLocked = (status: string) => status === 'completed' || status === 'archived';

const ExperimentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const sampleModal = useDisclosure();
  const resultModal = useDisclosure();
  const [sampleError, setSampleError] = useState('');
  const [resultError, setResultError] = useState('');

  const { data: experiment, isLoading } = useQuery<ExperimentDetail>({
    queryKey: ['experiments', id],
    queryFn: () => apiClient.get(`experiments/${id}`).json<ExperimentDetail>(),
    enabled: !!id,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['experiments', id] });
    qc.invalidateQueries({ queryKey: ['experiments'] });
  };

  const transitionMutation = useMutation({
    mutationFn: (status: string) =>
      apiClient.patch(`experiments/${id}/status`, { json: { status } }).json(),
    onSuccess: invalidate,
  });

  const {
    register: regSample, handleSubmit: hsSample, reset: resetSample,
    formState: { errors: eSample, isSubmitting: submittingSample },
  } = useForm<AddSampleForm>({ resolver: zodResolver(addSampleSchema) });

  const addSampleMutation = useMutation({
    mutationFn: (body: AddSampleForm) =>
      apiClient.post(`experiments/${id}/samples`, {
        json: { sample_id: body.sample_id, notes: body.notes || null },
      }).json(),
    onSuccess: () => {
      invalidate();
      resetSample();
      sampleModal.close();
      setSampleError('');
    },
    onError: () => setSampleError('Failed to add sample. It may already be linked or not found.'),
  });

  const removeSampleMutation = useMutation({
    mutationFn: (sampleId: string) =>
      apiClient.delete(`experiments/${id}/samples/${sampleId}`),
    onSuccess: invalidate,
  });

  const {
    register: regResult, handleSubmit: hsResult, reset: resetResult,
    formState: { errors: eResult, isSubmitting: submittingResult },
  } = useForm<ResultForm>({
    resolver: zodResolver(resultSchema),
    defaultValues: { interpretation: 'pending' },
  });

  const recordResultMutation = useMutation({
    mutationFn: (body: ResultForm) =>
      apiClient.post(`experiments/${id}/results`, {
        json: {
          ...body,
          unit: body.unit || null,
          reference_range: body.reference_range || null,
          notes: body.notes || null,
          sample_id: body.sample_id || null,
        },
      }).json(),
    onSuccess: () => {
      invalidate();
      resetResult();
      resultModal.close();
      setResultError('');
    },
    onError: () => setResultError('Failed to record result.'),
  });

  if (isLoading) return <div className={styles.page}><p>Loading…</p></div>;
  if (!experiment) return <div className={styles.page}><p>Experiment not found.</p></div>;

  const nextStatuses = VALID_TRANSITIONS[experiment.status] ?? [];
  const locked = isLocked(experiment.status);

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/experiments')}>
        ← Experiments
      </button>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h1 className={styles.heading}>{experiment.title}</h1>
            <p className={styles.sub}>Created by {experiment.created_by}</p>
          </div>
          <StatusBadge status={experiment.status} />
        </div>

        <dl className={styles.meta}>
          {experiment.started_at && (
            <><dt>Started</dt><dd>{new Date(experiment.started_at).toLocaleDateString()}</dd></>
          )}
          {experiment.completed_at && (
            <><dt>Completed</dt><dd>{new Date(experiment.completed_at).toLocaleDateString()}</dd></>
          )}
          {experiment.protocol && <><dt>Protocol</dt><dd className={styles.protocol}>{experiment.protocol}</dd></>}
          {experiment.notes && <><dt>Notes</dt><dd>{experiment.notes}</dd></>}
          <dt>Created</dt><dd>{new Date(experiment.created_at).toLocaleString()}</dd>
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

      {/* Samples section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Samples ({experiment.experiment_samples.length})</h2>
          {!locked && <Button onClick={sampleModal.open}>+ Add Sample</Button>}
        </div>

        {experiment.experiment_samples.length === 0 ? (
          <p className={styles.empty}>No samples linked yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Type</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Added</th>
                {!locked && <th></th>}
              </tr>
            </thead>
            <tbody>
              {experiment.experiment_samples.map((es) => (
                <tr key={es.id}>
                  <td className={styles.mono}>{es.sample.barcode}</td>
                  <td className={styles.cap}>{es.sample.sample_type}</td>
                  <td><StatusBadge status={es.sample.status} /></td>
                  <td>{es.notes ?? '—'}</td>
                  <td>{new Date(es.added_at).toLocaleDateString()}</td>
                  {!locked && (
                    <td>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeSampleMutation.mutate(es.sample_id)}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Results section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Results ({experiment.results.length})</h2>
          {experiment.status !== 'archived' && (
            <Button onClick={resultModal.open}>+ Record Result</Button>
          )}
        </div>

        {experiment.results.length === 0 ? (
          <p className={styles.empty}>No results recorded yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Analyte</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Ref Range</th>
                <th>Interpretation</th>
                <th>Sample</th>
                <th>Recorded by</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {experiment.results.map((r) => {
                const linked = experiment.experiment_samples.find(es => es.sample_id === r.sample_id);
                return (
                  <tr key={r.id}>
                    <td className={styles.analyte}>{r.analyte}</td>
                    <td className={styles.value}>{r.value}</td>
                    <td>{r.unit ?? '—'}</td>
                    <td>{r.reference_range ?? '—'}</td>
                    <td>
                      <span
                        className={styles.interp}
                        style={{ color: INTERP_COLORS[r.interpretation] ?? '#374151' }}
                      >
                        {r.interpretation}
                      </span>
                    </td>
                    <td className={styles.mono}>{linked?.sample.barcode ?? '—'}</td>
                    <td className={styles.actor}>{r.recorded_by}</td>
                    <td>{new Date(r.recorded_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {sampleModal.isOpen && (
        <Modal
          header="Add Sample"
          closeModal={sampleModal.close}
          height="280px"
          modalContent={
            <form onSubmit={hsSample((d) => addSampleMutation.mutate(d))} className={styles.form}>
              <label className={styles.label}>
                Sample ID (UUID) *
                <input className={styles.input} {...regSample('sample_id')} autoFocus placeholder="Paste sample UUID" />
                {eSample.sample_id && <span className={styles.error}>{eSample.sample_id.message}</span>}
              </label>
              <label className={styles.label}>
                Notes
                <input className={styles.input} {...regSample('notes')} />
              </label>
              {sampleError && <p className={styles.error}>{sampleError}</p>}
              <div className={styles.actions}>
                <Button type="button" variant="cancel" onClick={sampleModal.close}>Cancel</Button>
                <Button type="submit" disabled={submittingSample}>Add</Button>
              </div>
            </form>
          }
        />
      )}

      {resultModal.isOpen && (
        <Modal
          header="Record Result"
          closeModal={resultModal.close}
          height="500px"
          modalContent={
            <form onSubmit={hsResult((d) => recordResultMutation.mutate(d))} className={styles.form}>
              <label className={styles.label}>
                Analyte *
                <input className={styles.input} {...regResult('analyte')} autoFocus placeholder="e.g. Colony count, pH, OD600" />
                {eResult.analyte && <span className={styles.error}>{eResult.analyte.message}</span>}
              </label>
              <div className={styles.row2}>
                <label className={styles.label}>
                  Value *
                  <input className={styles.input} {...regResult('value')} placeholder="e.g. 3.4×10⁵, Positive" />
                  {eResult.value && <span className={styles.error}>{eResult.value.message}</span>}
                </label>
                <label className={styles.label}>
                  Unit
                  <input className={styles.input} {...regResult('unit')} placeholder="CFU/mL, pH, etc." />
                </label>
              </div>
              <label className={styles.label}>
                Reference Range
                <input className={styles.input} {...regResult('reference_range')} placeholder="e.g. &lt;10³ CFU/mL" />
              </label>
              <label className={styles.label}>
                Interpretation *
                <select className={styles.input} {...regResult('interpretation')}>
                  <option value="pending">Pending</option>
                  <option value="normal">Normal</option>
                  <option value="abnormal">Abnormal</option>
                  <option value="inconclusive">Inconclusive</option>
                </select>
              </label>
              <label className={styles.label}>
                Linked Sample
                <select className={styles.input} {...regResult('sample_id')}>
                  <option value="">— Experiment-level —</option>
                  {experiment.experiment_samples.map(es => (
                    <option key={es.sample_id} value={es.sample_id}>{es.sample.barcode}</option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                Notes
                <input className={styles.input} {...regResult('notes')} />
              </label>
              {resultError && <p className={styles.error}>{resultError}</p>}
              <div className={styles.actions}>
                <Button type="button" variant="cancel" onClick={resultModal.close}>Cancel</Button>
                <Button type="submit" disabled={submittingResult}>Record</Button>
              </div>
            </form>
          }
        />
      )}
    </div>
  );
};

export default ExperimentDetailPage;
