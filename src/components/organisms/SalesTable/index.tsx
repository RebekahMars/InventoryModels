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
        key: "aerobic_orders",
        header: "Aerobic Culture Orders"
    },
    {
        key: "anaerobic_orders",
        header: "Anaerobic Culture Orders"
    },
    {
        key: "fungal_orders",
        header: "Fungal Culture Orders"
    },
    {
        key: "cl_orders",
        header: "CL Culture Orders"
    },
    {
        key: "mycobacterium_orders",
        header: "Mycobacterium Culture Orders"
    },
    {
        key: "mycoplasma_orders",
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