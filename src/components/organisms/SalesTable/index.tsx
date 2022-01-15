import React, {useState, useEffect} from "react";
import styled from "styled-components";
import Loader from "react-loader-spinner";
import { fetchSalesData } from "../../../requests";
import Table from "../../molecules/Table";
import { TableColumns} from "../../molecules/Table";

const StyledLoader = styled(Loader)`
    position: fixed;
    top: 50%;
    left:50%;
    transform: translate(-50%,50%);
    height: 10px;
    width: 10px;
    timeout: 5000ms; //5 secs
`;

const columns: TableColumns<Sales, keyof Sales>[] = [
    {
        key: "order_date",
        header: "Order Data"
    },
    {
        key: "aerobic",
        header: "Aerobic Culture Orders"
    },
    {
        key: "anaerobic",
        header: "Anaerobic Culture Orders"
    },
    {
        key: "fungal",
        header: "Fungal Culture Orders"
    },
    {
        key: "cl",
        header: "CL Culture Orders"
    },
    {
        key: "mycobacterium",
        header: "Mycobacterium Culture Orders"
    },
    {
        key: "mycoplasma",
        header: "Mycoplasma Culture Orders"
    },
];

const LabSalesTable: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [inventory, setInventory] = useState<Sales[]>([]);
    
    useEffect(() => {
        const data = fetchSalesData();
        data.then(results => {
            setInventory(results);
            setIsLoading(false);
        })
    }, [])
    
    return (
        isLoading ? 
        <StyledLoader type="Circles" color="lightblue"/>
    : <Table tableColumns={columns} tableData={inventory}/>) 
};

export default LabSalesTable;