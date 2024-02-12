import { Item } from "../models/Item";
import api from "./AxiosInterceptor";

export const fetchItemById = async (itemId: string) => {
  await new Promise<Item>((resolve) => setTimeout(resolve, 50));

  api.get(`/items/${itemId}`);
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
  const response = await api.get<Item[]>(`/items?${queryParams}`);
  console.log(response.data);
  return response.data; // Assuming the response structure includes a `data` field with the items
};
