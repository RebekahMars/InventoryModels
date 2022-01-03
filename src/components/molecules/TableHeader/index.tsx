import React from 'react';
import {TableColumns} from '../Table';
import styled from 'styled-components';

export interface TableHeaderProps<T, K extends keyof T> {
    tableColumns: Array<TableColumns<T, K>>;
}

const StyledTableHeader = styled.th`
    width: 150px;
    border-bottom-width: 2px;
`;

const StyledTableRow = styled.tr`
    text-align: left;
`;

const StyledTableHead = styled.thead`
    border-bottom-with: 2px;

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