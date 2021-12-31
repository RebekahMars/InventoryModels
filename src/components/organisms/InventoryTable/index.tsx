import React, {useState, useEffect} from "react";
import { fetchInventoryData } from "../../../requests";
import Table from "../../molecules/Table";
import { TableColumns} from "../../molecules/Table";


const columns: TableColumns<Inventory, keyof Inventory>[] = [
    {
        key: 'id',
        header: "ID"
    },
    {
        key: "name",
        header: "Name"
    },
    {
        key: "quantity",
        header: "Quantity"
    },
    {
        key: "orderDate",
        header: "Order Date"
    },
    {
        key: "expiration",
        header: "Expiration"
    },
    {
        key: "minAmount",
        header: "Min"
    },
    {
        key: "maxAmount",
        header: "Max"
    },
    {
        key: "description",
        header: "Description"
    },
]

const LabInventoryTable: React.FC = () => {
    const [inventory, setInventory] = useState<Inventory[]>([]);
    
    useEffect(() => {
        const data = fetchInventoryData();
        data.then(results => {
            setInventory(results);
        })
    }, [inventory])
    

    return (
        <Table tableColumns={columns} tableData={inventory}/>
    )
};

export default LabInventoryTable;