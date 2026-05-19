import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`${styles.badge} ${styles[status] ?? styles.default}`}>
    {status}
  </span>
);

export default StatusBadge;
