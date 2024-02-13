export interface Item {
    id: string;
    userID: string;
    title: string;
    description: string;
    quantity: number;
    categories?: string[];
    status: string;
}