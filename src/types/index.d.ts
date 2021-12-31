interface ButtonProps{
    type: 'button' | 'submit' | 'cancel';
}
interface Inventory {
    id?: number;
    name: string;
    quantity: number;
    orderDate: Date;
    expiration: Date;
    minAmount: number;
    maxAmount: number;
    description: string;
}

interface InventoryItem extends Inventory {
    lotNumber?: string;
}
interface MainPageProps {
    message: string;
}