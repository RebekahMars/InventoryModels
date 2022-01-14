interface ButtonProps{
    type: 'button' | 'submit' | 'cancel';
}
interface Inventory {
    id?: number;
    name: string;
    lot_number: string;
    quantity: number;
    order_date: Date;
    expiration_date: Date;
    min_amount: number;
    max_amount: number;
    description: string;
};

interface InventoryItem extends Inventory {
    lotNumber?: string;
};
interface MainPageProps {
    message?: string;
};

interface PredictionProps {
    periods: number;
};