// services/RatingService.ts

import { AxiosResponse } from "axios";
import { Rating } from "../models/Rating"; // Adjust the path as necessary
import api from "./AxiosInterceptor";

export const createRating = async (ratingData: Omit<Rating, 'id' | 'createdAt'>): Promise<string> => {
  const response = await api.post<{ id: string }>('/ratings', ratingData);
  return response.data.id;
};

export const fetchRatingById = async (ratingId: string): Promise<Rating> => {
  const response = await api.get<Rating>(`/ratings/${ratingId}`);
  return response.data;
};

export const updateRating = async (ratingId: string, updateData: Partial<Rating>): Promise<Rating> => {
  const response = await api.put<Rating>(`/ratings/${ratingId}`, updateData);
  return response.data;
};

export const deleteRating = async (ratingId: string): Promise<AxiosResponse> => {
  return api.delete(`/ratings/${ratingId}`);
};

export const fetchUserRatings = async (userId: string): Promise<Rating[]> => {
    const response = await api.get<{ ratings: Rating[] }>(`${userId}/ratings`);
    return response.data.ratings;
};

export const fetchItemRatings = async (itemId: string): Promise<Rating[]> => {
    const response = await api.get<{ ratings: Rating[] }>(`/${itemId}/ratings`);
    return response.data.ratings;
};