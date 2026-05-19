import React from 'react';
import type { TableColumns } from '../Table/Table';
import styles from './TableRow.module.css';

interface TableRowProps<T, K extends keyof T> {
  rowData: Array<T>;
  rowColumns: Array<TableColumns<T, K>>;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
}

const TableRows = <T, K extends keyof T>({ rowData, rowColumns, onRowClick, actions }: TableRowProps<T, K>) => (
  <tbody className={styles.tbody}>
    {rowData.map((row, rowIdx) => (
      <tr
        key={`row-${rowIdx}`}
        className={[styles.tr, !onRowClick ? styles.noClick : ''].join(' ')}
        onClick={() => onRowClick?.(row)}
      >
        {rowColumns.map((col, colIdx) => (
          <td key={`cell-${rowIdx}-${colIdx}`} className={styles.td}>
            {row[col.key] as React.ReactNode}
          </td>
        ))}
        {actions && <td className={styles.actionsCell}>{actions(row)}</td>}
      </tr>
    ))}
  </tbody>
);

export default TableRows;
