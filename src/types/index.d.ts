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

interface Sales {
    id?: number;
    order_date: Date;
    aerobic_orders: number;
    anaerobic_orders: number;
    fungal_orders: number;
    cl_orders: number;
    mycobacterium_orders: number;
    mycoplasma_orders: number;

}

interface InventoryItem extends Inventory {
    lotNumber?: string;
};
interface MainPageProps {
    message?: string;
};

interface PredictionProps {
    periods: number;
};

interface PredictionInputs {
    predictionPeriods: number;
}

interface PredictionFormProps {
    titleText?: string;
    headerText?: string;
    submitText?: string;
    submitPrediction: (number) => void;
}
