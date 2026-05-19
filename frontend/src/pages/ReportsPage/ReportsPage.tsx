import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { apiClient } from '../../lib/apiClient';
import styles from './ReportsPage.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ForecastPoint {
  date: string;
  value: number;
  lower: number;
  upper: number;
}

interface ForecastResponse {
  historical: { date: string; value: number }[];
  models: {
    arima: ForecastPoint[];
    ets: ForecastPoint[];
    linear: ForecastPoint[];
  };
  metrics: {
    arima: { mae: number; rmse: number };
    ets: { mae: number; rmse: number };
    linear: { mae: number; rmse: number };
  };
}

const MODEL_META = {
  arima:  { label: 'ARIMA',             color: '#2563eb' },
  ets:    { label: 'Holt-Winters ETS',  color: '#d97706' },
  linear: { label: 'Trend + Fourier',   color: '#16a34a' },
} as const;

type ModelKey = keyof typeof MODEL_META;

const HORIZON_OPTIONS = [30, 60, 90] as const;

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const ReportsPage = () => {
  const [horizon, setHorizon] = useState<30 | 60 | 90>(90);
  const [activeModels, setActiveModels] = useState<Set<ModelKey>>(
    new Set(['arima', 'ets', 'linear'])
  );

  const { data, isLoading, isFetching } = useQuery<ForecastResponse>({
    queryKey: ['reports', 'forecast', horizon],
    queryFn: () => apiClient.get(`reports/forecast?horizon=${horizon}`).json<ForecastResponse>(),
    staleTime: 5 * 60_000,
  });

  const toggleModel = (key: ModelKey) =>
    setActiveModels((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const chartData = (() => {
    if (!data) return { labels: [], datasets: [] };

    const histDates = data.historical.map((h) => h.date);
    const fcDates = data.models.arima.map((p) => p.date);
    const allDates = [...histDates, ...fcDates];

    // Thin labels: show every ~14th date on the x-axis
    const labelStep = Math.max(1, Math.floor(allDates.length / 20));

    const datasets: object[] = [
      {
        label: 'Actual',
        data: [...data.historical.map((h) => h.value), ...Array(fcDates.length).fill(null)],
        borderColor: '#94a3b8',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
        order: 10,
      },
    ];

    for (const key of (['arima', 'ets', 'linear'] as ModelKey[])) {
      if (!activeModels.has(key)) continue;
      const meta = MODEL_META[key];
      const fc = data.models[key];
      const nullPad = Array(histDates.length).fill(null);

      datasets.push({
        label: `${meta.label} CI`,
        data: [...nullPad, ...fc.map((p) => p.upper)],
        borderColor: 'transparent',
        backgroundColor: hexToRgba(meta.color, 0.12),
        fill: '+1',
        pointRadius: 0,
        tension: 0.3,
        order: 5,
      });
      datasets.push({
        label: `${meta.label} CI lower`,
        data: [...nullPad, ...fc.map((p) => p.lower)],
        borderColor: 'transparent',
        backgroundColor: hexToRgba(meta.color, 0.12),
        fill: false,
        pointRadius: 0,
        tension: 0.3,
        order: 5,
      });
      datasets.push({
        label: meta.label,
        data: [...nullPad, ...fc.map((p) => p.value)],
        borderColor: meta.color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        order: 1,
      });
    }

    return {
      labels: allDates.map((d, i) => (i % labelStep === 0 ? d.slice(5) : '')),
      datasets,
    };
  })();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (item: { dataset: { label?: string } }) =>
          !item.dataset.label?.includes('CI'),
      },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 }, color: '#94a3b8', maxRotation: 0 },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 }, color: '#94a3b8' },
        title: { display: true, text: 'Test Orders / Day', font: { size: 11 }, color: '#64748b' },
      },
    },
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Reports & Forecasting</h1>
      <p className={styles.sub}>
        Daily diagnostic test order volume — historical actuals with {horizon}-day multi-model forecast.
      </p>

      <div className={styles.controls}>
        <div className={styles.horizonGroup}>
          {HORIZON_OPTIONS.map((h) => (
            <button
              key={h}
              type="button"
              className={`${styles.horizonBtn} ${horizon === h ? styles.horizonActive : ''}`}
              onClick={() => setHorizon(h)}
            >
              {h}d
            </button>
          ))}
        </div>

        <div className={styles.modelToggles}>
          {(Object.keys(MODEL_META) as ModelKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`${styles.modelBtn} ${activeModels.has(key) ? styles.modelActive : ''}`}
              style={activeModels.has(key) ? {
                borderColor: MODEL_META[key].color,
                color: MODEL_META[key].color,
                background: hexToRgba(MODEL_META[key].color, 0.06),
              } : {}}
              onClick={() => toggleModel(key)}
            >
              {MODEL_META[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartCard}>
        {(isLoading || isFetching) && <div className={styles.chartLoader}>Computing forecasts…</div>}
        <div className={styles.chartWrap}>
          {data && <Line data={chartData} options={chartOptions} />}
        </div>
      </div>

      {data && (
        <div className={styles.metricsSection}>
          <h2 className={styles.metricsTitle}>Model Accuracy (30-day holdout)</h2>
          <table className={styles.metricsTable}>
            <thead>
              <tr>
                <th>Model</th>
                <th>MAE</th>
                <th>RMSE</th>
                <th>Lower is better</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(MODEL_META) as ModelKey[]).map((key) => {
                const m = data.metrics[key];
                const meta = MODEL_META[key];
                const best = Math.min(
                  data.metrics.arima.mae, data.metrics.ets.mae, data.metrics.linear.mae
                );
                return (
                  <tr key={key}>
                    <td>
                      <span className={styles.modelSwatch} style={{ background: meta.color }} />
                      {meta.label}
                    </td>
                    <td className={m.mae === best ? styles.bestVal : ''}>{m.mae}</td>
                    <td>{m.rmse}</td>
                    <td>
                      {m.mae === best ? (
                        <span className={styles.bestBadge}>Best MAE</span>
                      ) : (
                        <span className={styles.diffVal}>+{(m.mae - best).toFixed(2)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className={styles.metricNote}>
            MAE = Mean Absolute Error · RMSE = Root Mean Square Error · both in orders/day
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
