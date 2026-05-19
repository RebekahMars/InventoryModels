import React from 'react';
import TableHeader from '../TableHeader/TableHeader';
import TableRows from '../TableRow/TableRow';
import styles from './Table.module.css';

export interface TableColumns<T, K extends keyof T> {
  key: K;
  header: string;
}

export interface TableProps<T, K extends keyof T> {
  tableColumns: Array<TableColumns<T, K>>;
  tableData: Array<T>;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
}

const Table = <T, K extends keyof T>({ tableColumns, tableData, onRowClick, actions }: TableProps<T, K>) => (
  <div className={styles.tableWrapper}>
    <table className={styles.table}>
      <TableHeader tableColumns={tableColumns} hasActions={!!actions} />
      <TableRows
        rowData={tableData}
        rowColumns={tableColumns}
        onRowClick={onRowClick}
        actions={actions}
      />
    </table>
  </div>
);

export default Table;
