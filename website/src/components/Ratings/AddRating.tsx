import React, { useState } from "react";
import { Rating } from "../../models/Rating";
import { createRating } from "../../services/RatingService";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";

interface AddRatingProps {
  onSuccess: () => void;
  onCanceled: () => void;
  recipientID: string;
  recipientIsItem: boolean;
}

const AddRating: React.FC<AddRatingProps> = ({
  onSuccess,
  recipientID,
  recipientIsItem,
  onCanceled,
}) => {
  const auth = useAuth();
  const [ratingData, setRatingData] = useState<
    Omit<Rating, "id" | "createdAt">
  >({
    creatorID: auth.user?.id || "",
    recipientID: recipientID,
    recipientIsItem: recipientIsItem,
    title: "",
    body: "",
    stars: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setRatingData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const updateStars = (stars: number) => {
    setRatingData((prevData) => ({
      ...prevData,
      stars: stars,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth.user) {
      return;
    }

    try {
      createRating(ratingData).then(() => {
        onSuccess();
      }).catch((e) => {
        setError(e.response.data.error);
      })
    } catch (error) {
      console.error("Error creating rating:", error);
    }
  };

  return (
    <>
      {auth?.user?.id === recipientID && (
        <>
          {/* TODO: better styling */}
          <div className="text-red-500">You can't rate yourself.</div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCanceled}
          >
            Cancel
          </button>
        </>
      )}

      {auth?.user?.id !== recipientID && (
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="space-y-2">
            <StarRating rating={ratingData.stars} allowClick={updateStars} />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="space-y-2">
            <label htmlFor="title" className="block font-semibold">
              Review Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={ratingData.title}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Enter title"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="body" className="block font-semibold">
              Review Text
            </label>
            <textarea
              id="body"
              name="body"
              value={ratingData.body}
              onChange={handleChange}
              className="input input-bordered w-full"
              rows={4}
              placeholder="Enter body"
              required
            ></textarea>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCanceled}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Rating
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default AddRating;
