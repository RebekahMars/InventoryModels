import React, {useState, useEffect} from "react";
import styled from "styled-components";
import Loader from "react-loader-spinner";
import { fetchInventoryData } from "../../../requests";
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

const columns: TableColumns<Inventory, keyof Inventory>[] = [
    {
        key: "name",
        header: "Name"
    },
    {
        key: "lot_number",
        header: "Lot Number"
    },
    {
        key: "quantity",
        header: "Quantity"
    },
    {
        key: "order_date",
        header: "Order Date"
    },
    {
        key: "expiration_date",
        header: "Expiration"
    },
    {
        key: "min_amount",
        header: "Min"
    },
    {
        key: "max_amount",
        header: "Max"
    },
    {
        key: "description",
        header: "Description"
    },
];

const LabInventoryTable: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    
    useEffect(() => {
        const data = fetchInventoryData();
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

export default LabInventoryTable;