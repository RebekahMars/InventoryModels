import type { TableColumns } from '../Table/Table';
import styles from './TableHeader.module.css';

interface TableHeaderProps<T, K extends keyof T> {
  tableColumns: Array<TableColumns<T, K>>;
  hasActions?: boolean;
}

const TableHeader = <T, K extends keyof T>({ tableColumns, hasActions }: TableHeaderProps<T, K>) => (
  <thead className={styles.thead}>
    <tr className={styles.tr}>
      {tableColumns.map((col, i) => (
        <th key={`head-${i}`} className={styles.th}>
          {col.header}
        </th>
      ))}
      {hasActions && <th className={styles.th} />}
    </tr>
  </thead>
);

export default TableHeader;
