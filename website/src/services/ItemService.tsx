import { Item } from "../models/Item";

const items: Item[] = [
  {
    id: "1",
    userid: "2",
    title: "Vintage Lamp",
    description: "A beautiful vintage lamp to light up your room.",
    quanity: 1,
    categories: ["Furniture", "Lighting"],
    status: "Available",
  },
  {
    id: "2",
    userid: "3",
    title: "Leather Sofa",
    description: "A comfortable leather sofa in excellent condition.",
    quanity: 1,
    categories: ["Furniture"],
    status: "Available",
  },
  {
    id: "3",
    userid: "2",
    title: "Wooden Dining Table",
    description: "A sturdy wooden dining table for family dinners.",
    quanity: 1,
    categories: ["Furniture"],
    status: "Available",
  },
];

export const fetchItemById = async (itemId: string) => {
  await new Promise<Item>((resolve) => setTimeout(resolve, 50));

  const item = items.find((item) => item.id === itemId);
  return item
    ? Promise.resolve(item)
    : Promise.reject(new Error("Item not found"));
};

export const fetchAllItems = async () => {
  // Simulate an API call with a delay
  await new Promise<Item[]>((resolve) => setTimeout(resolve, 50));

  return Promise.resolve(items);
};
