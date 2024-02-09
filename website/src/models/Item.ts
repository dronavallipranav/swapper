export interface Item {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    categories?: string[];
    createdByUserID: string;
}