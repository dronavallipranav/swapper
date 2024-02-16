import { Location } from "../services/LocationService";

export interface Item {
    id: string;
    userId: string;
    title: string;
    description: string;
    quantity: number;
    categories?: string[];
    status: string;
    images?: string[];
    attachments?: string[];
    location?: Location
}