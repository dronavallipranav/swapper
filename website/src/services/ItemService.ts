import { AxiosResponse } from "axios";
import { Item } from "../models/Item";
import api from "./AxiosInterceptor";

export const fetchItemById = async (itemId: string): Promise<Item> => {
  const response = await api.get<{ item: Item }>(`/${itemId}`);
  return response.data.item;
};

export const fetchItemsByUserId = async (userId: string): Promise<Item[]> => {
  const response = await api.get<{ items: Item[] }>(`${userId}/items`);
  return response.data.items;
}

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
  attributes = {},
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
  attributes?: Record<string, string[]>;
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
    attributes: JSON.stringify(attributes),
  }).toString();

  // Use `api.get` to make the request with query parameters
  const response = await api.get<{ items: Item[] }>(`/items?${queryParams}`);
  return response.data.items; // Assuming the response structure includes a `data` field with the items
};

export const createItem = async (formData: FormData): Promise<string> => {
  const response = await api.post<{ id: string }>("/items", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.id;
};

export const deleteItem = async (itemId: string): Promise<AxiosResponse> => {
  return api.delete(`/${itemId}`);
};

export const fetchItemAttributes = async (): Promise<
  Record<string, string[]>
> => {
  const response = await api.get<{ attributes: Record<string, string[]> }>(
    "/items/attributes"
  );
  return response.data.attributes;
};
