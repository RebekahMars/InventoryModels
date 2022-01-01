import React from 'react';
import {TableColumns} from '../Table';
import styled from 'styled-components';

export interface TableHeaderProps<T, K extends keyof T> {
    tableColumns: Array<TableColumns<T, K>>;
}

const StyledTableHeader = styled.th`
    width: 6rem;
    border: none;
`;

const StyledTableRow = styled.tr`
    border-collapse: collapse;
    border-right: 1px solid black;
`;

const StyledTableHead = styled.thead`
    border-bottom: 1px solid black;
`;

const TableHeader = <T, K extends keyof T>({tableColumns}: TableHeaderProps<T, K>): JSX.Element => {
    const tableHeaders = tableColumns.map((col, index) => {
        return(
            <StyledTableHeader key={`headCell-${index}`}>
                {col.header}
            </StyledTableHeader>
        );
    });

    return (
        <StyledTableHead>
            <StyledTableRow>{tableHeaders}</StyledTableRow>
        </StyledTableHead>
    )
}

export default TableHeader;