import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { apiClient } from '../../lib/apiClient';
import styles from './DashboardPage.module.css';

interface Summary {
  samples: { total: number; by_status: Record<string, number> };
  inventory: { total: number; low_stock: number; expiring: number; expired: number };
  experiments: { total: number; by_status: Record<string, number> };
  recent_samples: { id: string; barcode: string; sample_type: string; status: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  received:   '#1d4ed8',
  processing: '#92400e',
  stored:     '#15803d',
  disposed:   '#b91c1c',
  draft:      '#475569',
  active:     '#1d4ed8',
  completed:  '#15803d',
  archived:   '#374151',
};

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: summary, isLoading } = useQuery<Summary>({
    queryKey: ['reports', 'summary'],
    queryFn: () => apiClient.get('reports/summary').json<Summary>(),
    staleTime: 60_000,
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>
      <p className={styles.welcome}>Welcome, {user?.full_name}.</p>

      {isLoading ? (
        <p className={styles.loading}>Loading…</p>
      ) : summary && (
        <>
          <div className={styles.cards}>
            <div className={styles.card} onClick={() => navigate('/samples')} role="button" tabIndex={0}>
              <div className={styles.cardLabel}>Total Samples</div>
              <div className={styles.cardValue}>{summary.samples.total}</div>
              <div className={styles.cardBreakdown}>
                {Object.entries(summary.samples.by_status).map(([s, n]) => (
                  <span key={s} className={styles.dot} style={{ color: STATUS_COLORS[s] ?? '#374151' }}>
                    {s} {n}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.card} onClick={() => navigate('/inventory')} role="button" tabIndex={0}>
              <div className={styles.cardLabel}>Inventory Items</div>
              <div className={styles.cardValue}>{summary.inventory.total}</div>
              <div className={styles.cardBreakdown}>
                {summary.inventory.expired > 0 && (
                  <span className={styles.alertChip} style={{ background: '#fee2e2', color: '#b91c1c' }}>
                    {summary.inventory.expired} expired
                  </span>
                )}
                {summary.inventory.expiring > 0 && (
                  <span className={styles.alertChip} style={{ background: '#fef9c3', color: '#92400e' }}>
                    {summary.inventory.expiring} expiring
                  </span>
                )}
                {summary.inventory.low_stock > 0 && (
                  <span className={styles.alertChip} style={{ background: '#ffedd5', color: '#c2410c' }}>
                    {summary.inventory.low_stock} low stock
                  </span>
                )}
                {summary.inventory.expired === 0 && summary.inventory.expiring === 0 && summary.inventory.low_stock === 0 && (
                  <span className={styles.ok}>All clear</span>
                )}
              </div>
            </div>

            <div className={styles.card} onClick={() => navigate('/experiments')} role="button" tabIndex={0}>
              <div className={styles.cardLabel}>Experiments</div>
              <div className={styles.cardValue}>{summary.experiments.total}</div>
              <div className={styles.cardBreakdown}>
                {Object.entries(summary.experiments.by_status).map(([s, n]) => (
                  <span key={s} className={styles.dot} style={{ color: STATUS_COLORS[s] ?? '#374151' }}>
                    {s} {n}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.card} onClick={() => navigate('/reports')} role="button" tabIndex={0}>
              <div className={styles.cardLabel}>Forecasting</div>
              <div className={styles.cardValue}>3</div>
              <div className={styles.cardBreakdown}>
                <span className={styles.ok}>ARIMA · ETS · Trend+Fourier</span>
              </div>
            </div>
          </div>

          {summary.recent_samples.length > 0 && (
            <div className={styles.recentSection}>
              <h2 className={styles.sectionTitle}>Recent Samples</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Barcode</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recent_samples.map((s) => (
                    <tr key={s.id} className={styles.row} onClick={() => navigate(`/samples/${s.id}`)}>
                      <td className={styles.mono}>{s.barcode}</td>
                      <td className={styles.cap}>{s.sample_type}</td>
                      <td>
                        <span className={styles.statusDot} style={{ color: STATUS_COLORS[s.status] ?? '#374151' }}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
