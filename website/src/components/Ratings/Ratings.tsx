import React, { useEffect, useState } from "react";
import ProfilePictureOrInitial from "../ProfilePictureOrInitial";
import { User } from "../../models/User";
import { Rating } from "../../models/Rating";
import { getUser } from "../../services/AuthService";
import AddRating from "./AddRating";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import RatingStars from "./StarRating";
import RatingRow from "./RatingRow";
import { deleteRating } from "../../services/RatingService";

interface RatingsProps {
  ratings: Rating[];
  recipientID?: string;
  recipientIsItem?: boolean;
}

const Ratings: React.FC<RatingsProps> = ({
  ratings,
  recipientID,
  recipientIsItem,
}) => {
  const [users, setUsers] = useState<{ [userId: string]: User }>({});
  const [avgRating, setAvgRating] = useState<number>(0);
  const [numRatings, setNumRatings] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showAddRating, setShowAddRating] = useState<boolean>(false);
  const auth = useAuth();

  useEffect(() => {
    const sum = ratings.reduce((acc, rating) => acc + rating.stars, 0);
    setAvgRating(sum / ratings.length);
    setNumRatings(ratings.length);

    const fetchUsers = async () => {
      const uniqueUserIds = Array.from(
        new Set(ratings.map((rating) => rating.creatorID))
      );

      try {
        const fetchedUsers = await Promise.all(
          uniqueUserIds.map((userId) => getUser(userId))
        );

        const usersMap: { [userId: string]: User } = {};
        fetchedUsers.forEach((user) => {
          usersMap[user.id] = user;
        });

        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [ratings]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Ratings
        </h2>
        <div className="mb-4 md:mb-0">
          <RatingRow
            key={avgRating}
            avgRating={avgRating}
            numRatings={numRatings}
          />
        </div>
      </div>

      {ratings.length === 0 && (
        <div className="p-4 border border-gray-200 rounded-lg text-gray-600 bg-gray-50 mt-4">
          No ratings yet. Be the first to{" "}
          <button
            onClick={() => setShowAddRating(true)}
            className="text-blue-500 underline"
          >
            leave a rating
          </button>
          .
        </div>
      )}

      {ratings.map((rating) => (
        <div
          key={rating.id}
          className="p-4 border border-gray-200 rounded-lg shadow-md"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <ProfilePictureOrInitial user={users[rating.creatorID]} linkToProfile={true} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{rating.title}</h3>
                <RatingStars rating={rating.stars} />
              </div>
              <p className="text-gray-600">{rating.body}</p>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to={`/profile/${rating.creatorID}`}
              className="text-blue-500 underline"
            >
              {users[rating.creatorID]?.name}
            </Link>
            <span className="text-gray-500">
              {" "}
              on {new Date(rating.createdAt).toLocaleDateString()}
            </span>
          </div>
          {auth.user && auth.user.id === rating.creatorID && (
            <div className="mt-4">
              <button
                onClick={() => {
                  const isConfirmed = window.confirm(
                    "Are you sure you want to delete this rating?"
                  );
                  if (isConfirmed) {
                    deleteRating(rating.id);
                    // reload
                    window.location.reload();
                  }
                }}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}

      {auth.user && ratings.length > 0 && (
        <div className="p-4 border border-gray-200 rounded-lg text-gray-600 bg-gray-50 mt-4">
          <button
            onClick={() => setShowAddRating(true)}
            className="text-blue-500 underline"
          >
            Leave a rating
          </button>{" "}
          of this {recipientIsItem ? "item" : "user"}.
        </div>
      )}

      {/* Add the AddRating component here */}
      {auth.user &&
        showAddRating &&
        recipientID &&
        recipientIsItem !== undefined && (
          <div className="p-4 border border-gray-200 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Add Rating</h3>
            <AddRating
              onSuccess={() => {
                setShowAddRating(false);
                window.location.reload();
              }}
              onCanceled={() => setShowAddRating(false)}
              recipientID={recipientID}
              recipientIsItem={recipientIsItem}
            />
          </div>
        )}

      {/* TODO: make prettier */}
      {!auth.user && (
        <div className="p-4 border border-gray-200 rounded-lg text-gray-600 bg-gray-50 mt-4">
          Please{" "}
          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            className="text-blue-500 underline"
          >
            log in
          </button>{" "}
          to review this {recipientIsItem ? "item" : "user"}.
        </div>
      )}
    </div>
  );
};

export default Ratings;
