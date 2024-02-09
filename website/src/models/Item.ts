export interface Item {
    id: string;
    userid: string;
    title: string;
    description: string;
    quanity: number;
    categories?: string[];
    status: string;
}