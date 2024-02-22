import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/AxiosInterceptor";
import { Item } from "../../models/Item";
import { getUser } from "../../services/AuthService";
import { get, set } from "lodash";
import Header from "../../components/Header";
import { User } from "../../models/User";
import ProfilePictureOrInitial from "../../components/ProfilePictureOrInitial";
import { filledStar } from "../../components/Ratings/StarRating";
import { useAuth } from "../../contexts/AuthContext";
import { fetchItemsByUserId } from "../../services/ItemService";
import Ratings from "../../components/Ratings/Ratings";
import { Rating } from "../../models/Rating";
import { fetchUserRatings } from "../../services/RatingService";

const UserProfile = () => {
  const { userID } = useParams();
  const [userPage, setUserPage] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    getUser(`${userID}`)
      .then((user) => {
        setUserPage(user);
      })
      .catch((e) => {
        console.error(e);
      });

    fetchItemsByUserId(`${userID}`)
      .then((items) => {
        setItems(items);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [userID]);

  const isCurrentUser = user?.id === userID;

  useEffect(() => {
    fetchUserRatings(`${userID}`).then((fetchedRatings: Rating[]) => {
      setRatings(fetchedRatings);
    });
  }, [userID]);

  return (
    <div className="pb-8">
      <Header />
      <div className="container mx-auto px-4 py-10">
        <div className="text-center py-4">
          <h1 className="text-4xl font-bold">{userPage?.username}</h1>
          <h2 className="text-xl text-gray-600">
            {userPage?.username}'s Rating:{" "}
            <span className="w-3 h-3 inline-block mr-1">{filledStar}</span>{" "}
            {userPage?.avgRating ? userPage?.avgRating / 2 : 0}{" "}
          </h2>
          {isCurrentUser && (
            <div className="mt-4">
              <button onClick={() => nav("/profile/settings")} className="btn">
                Edit Profile
              </button>
            </div>
          )}
          {!isCurrentUser && userPage?.id && (
            <div className="mt-4">
              <button
                onClick={() =>
                  nav(`/messages/${encodeURIComponent(userPage?.id)}`)
                }
                className="btn"
              >
                Contact
              </button>
            </div>
          )}
          <h1 className="text-3xl mt-10 font-bold">Current Items</h1>
        </div>
        {items && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:grid-cols-4 justify-items-center">
            {items.map((item) => (
              <div
                key={item.id}
                className="card card-compact w-full md:w-75 bg-base-100 shadow-xl hover:scale-105 cursor-pointer transform transition-transform"
                onClick={() => {
                  nav(`/${item.id}`);
                }}
              >
                {item.attachments && item.attachments[0] && (
                  <figure className="overflow-hidden">
                    <img
                      src={item.attachments[0]}
                      alt="Item"
                      className="w-full h-48 md:h-72 object-cover"
                    />
                  </figure>
                )}

                <div className="card-body mt-[-8px]">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {item.title}
                    </h2>

                    <div className="flex items-center">
                      <span className="w-3 h-3 inline-block mr-1">
                        {filledStar}
                      </span>{" "}
                      <span>
                        {item.avgRating
                          ? (item.avgRating / 2).toFixed(1)
                          : "0.0"}
                      </span>
                    </div>
                  </div>

                  {item?.createdAt && (
                    <div className="flex items-center text-gray-400 text-xs">
                      <span className="ml-2">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span className="mx-1">·</span>
                      <span>
                        {new Date(item.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  )}

                  <p className="text-gray-700 mt-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {items && items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No items found for this user
            </h2>
          </div>
        )}
      </div>

      <div className="mt-8 p-8">
        <Ratings
          ratings={ratings || []}
          recipientID={userID}
          recipientIsItem={false}
        />
      </div>
    </div>
  );
};

export default UserProfile;
