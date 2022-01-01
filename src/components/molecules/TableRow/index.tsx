import React from 'react';
import {TableColumns} from '../Table';

export interface TableRowProps<T, K extends keyof T> {
    rowData: Array<T>;
    rowColumns: Array<TableColumns<T, K>>;
}

const TableRows = <T, K extends keyof T>({rowData, rowColumns}: TableRowProps<T, K>): JSX.Element => {
    const tableRows = rowData.map((row, row_index) => {
        return (
            <tr key={`cell-${row_index}`}>
                {rowColumns.map((col, col_index) => {
                    return (
                        <td key={`cell-${col_index}`}>
                            {row[col.key]}
                        </td>
                    );
                }
                )}
            </tr>
        ); 
    });

    return (
        <tbody>
            {tableRows}
        </tbody>
    );
};

export default TableRows;