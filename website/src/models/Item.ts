export interface Item {
    id: string;
    userId: string;
    title: string;
    description: string;
    quantity: number;
    categories?: string[];
    status: string;
}