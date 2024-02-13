import { AxiosResponse } from "axios";
import { Item } from "../models/Item";
import api from "./AxiosInterceptor";

export const fetchItemById = async (itemId: string): Promise<Item>  => {
  itemId = itemId.replace("items/", "")
  const response = await api.get<{item: Item}>(`/items/${itemId}`);
  return response.data.item;
};


export const fetchAllItems = async ({
  latitude,
  longitude,
  radius,
  categories,
  status,
  limit = 10,
  skip = 0,
  sort = "title",
  order = "asc",
  search = "",
}: {
  latitude: number;
  longitude: number;
  radius: number;
  categories: string[];
  status: string;
  limit?: number;
  skip?: number;
  sort?: string;
  order?: string;
  search?: string;
}): Promise<Item[]> => {
  // Construct query parameters string
  const queryParams = new URLSearchParams({
    lat: latitude.toString(),
    long: longitude.toString(),
    radius: radius.toString(),
    categories: categories.join(","),
    status,
    limit: limit.toString(),
    skip: skip.toString(),
    sort,
    order,
    search,
  }).toString();

  // Use `api.get` to make the request with query parameters
  const response = await api.get<{items: Item[]}>(`/items?${queryParams}`);
  return response.data.items; // Assuming the response structure includes a `data` field with the items
};

export const createItem = async (item: Item): Promise<string> => {
  const response = await api.post<{id: string}>(`/items`, item);
  return response.data.id;
}

export const deleteItem = async (itemId: string): Promise<AxiosResponse> => {
  return api.delete(`/items/${itemId.replace("items/", "")}`);
}