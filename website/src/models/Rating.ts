export interface Rating {
  id: string;
  creatorID: string;
  recipientID: string;
  recipientIsItem: boolean;
  title: string;
  body: string;
  stars: number;
  createdAt: string;
}
