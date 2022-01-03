import React from 'react';
import styled from 'styled-components';
import {TableColumns} from '../Table';

const StyledTableBody = styled.tbody`
    background-color: white;
    border-collapse: collapse;
`;

const StyledTableData = styled.td`
    border-collapse: collapse;
    background-color: white;
`;

const StyledTableRow = styled.tr`
    border-collapse: collapse;
    &:hover {
        cursor: pointer;
        background-color: blue;
    }
    
`;
export interface TableRowProps<T, K extends keyof T> {
    rowData: Array<T>;
    rowColumns: Array<TableColumns<T, K>>;
}

const TableRows = <T, K extends keyof T>({rowData, rowColumns}: TableRowProps<T, K>): JSX.Element => {
    const tableRows = rowData.map((row, row_index) => {
        return (
            <StyledTableRow key={`cell-${row_index}`}>
                {rowColumns.map((col, col_index) => {
                    return (
                        <StyledTableData key={`cell-${col_index}`}>
                            {row[col.key]}
                        </StyledTableData>
                    );
                }
                )}
            </StyledTableRow>
        ); 
    });

    return (
        <StyledTableBody>
            {tableRows}
        </StyledTableBody>
    );
};

export default TableRows;