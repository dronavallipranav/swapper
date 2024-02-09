import { Item } from "../models/Item";

const items: Item[] = [
  {
    id: "1",
    name: "Vintage Lamp",
    description: "A beautiful vintage lamp to light up your room.",
    imageUrl: "https://i.imgur.com/p2xbAbE.jpeg",
    createdByUserID: '1'
  },
  {
    id: "2",
    name: "Leather Sofa",
    description: "A comfortable leather sofa in excellent condition.",
    imageUrl: "https://i.imgur.com/p2xbAbE.jpeg",
    createdByUserID: '2',
  },
  {
    id: "3",
    name: "Wooden Dining Table",
    description: "A sturdy wooden dining table for family dinners.",
    imageUrl: "https://i.imgur.com/p2xbAbE.jpeg",
    createdByUserID: '3'
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
