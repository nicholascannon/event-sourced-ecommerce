export interface AddItemCommand {
    orderId: string;
    item: {
        id: string;
        price: number;
    };
}
