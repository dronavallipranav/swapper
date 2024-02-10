export interface Item {
    id: string;
    userID: string;
    title: string;
    description: string;
    quanity: number;
    categories?: string[];
    status: string;
}