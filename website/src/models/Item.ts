import { Location } from "../services/LocationService";

export interface Attributes {
  condition?: string[];
  size?: string[];
  color?: string[];
  listingType?: string[];
  itemCategory?: string[];
  ownershipHistory?: string[];
  authenticity?: string[];
}

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
  location?: Location;
  attributes?: Attributes;
  createdAt: string;
  avgRating?: number;
  numRatings?: number;
}
