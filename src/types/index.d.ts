interface ButtonProps{
    type: 'button' | 'submit' | 'cancel';
}
interface Inventory {
    id?: number;
    name: string;
    lot: string;
    quantity: number;
    order: Date;
    expiration: Date;
    min: number;
    max: number;
    description: string;
}

interface InventoryItem extends Inventory {
    lotNumber?: string;
}
interface MainPageProps {
    message: string;
}