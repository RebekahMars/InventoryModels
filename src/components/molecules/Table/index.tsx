import React from "react";
import styled from 'styled-components';
import TableHeader from "../TableHeader";
import TableRows from "../TableRow";
export interface TableColumns<T, K extends keyof T> {
    key: K;
    header: string;
}

export interface TableProps<T, K extends keyof T> {
    tableColumns: Array<TableColumns<T, K>>;
    tableData: Array<T>;
}

const StyledTable = styled.table`
    display: flex:
    flex-direction: column;
    text-align: inherit;
    padding-botom: 10px;
    border: 1px solid lightblue;
`;

const Table = <T, K extends keyof T>({ tableColumns, tableData}: TableProps<T, K>): JSX.Element => {
    return (
        <StyledTable>
            <TableHeader tableColumns={tableColumns} />
            <TableRows rowData={tableData} rowColumns={tableColumns}/>
        </StyledTable>
    );
};

export default Table;
