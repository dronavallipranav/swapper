import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchItemById, deleteItem } from "../../services/ItemService";
import { sendMessage } from "../../services/MessageService";
import { useAuth } from "../../contexts/AuthContext";
import { Item } from "../../models/Item";
import { User } from "../../models/User";
import { getUser } from "../../services/AuthService";
import ProfilePictureOrInitial from "../../components/ProfilePictureOrInitial";
import RatingRow from "../../components/Ratings/RatingRow";
import Ratings from "../../components/Ratings/Ratings";
import { Rating } from "../../models/Rating";
import {
  fetchItemRatings,
} from "../../services/RatingService";
import Header from "../../components/Header";

const ItemPage = () => {
  const { itemID } = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [numRatings, setNumRatings] = useState<number>(0);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [owner, setOwner] = useState<User>();
  const [isItemOwner, setIsItemOwner] = useState(false);
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!itemID) return;
    fetchItemById("items/" + itemID)
      .then((fetchedItem) => {
        setItem(fetchedItem);

        if (fetchedItem.userId === user?.id) {
          setIsItemOwner(true);
        }

        if (fetchedItem.userId) {
          getUser(fetchedItem.userId)
            .then((fetchedUser) => {
              setOwner(fetchedUser);
            })
            .catch((error) => setError("Failed to fetch owner details."));
        }

        if (fetchedItem.avgRating) setAvgRating(fetchedItem.avgRating);
        if (fetchedItem.numRatings) setNumRatings(fetchedItem.numRatings);

        setMessage(`Hi, I'm interested in your ${fetchedItem.title}`);
      })
      .catch((error) => setError("Failed to fetch item details."));

    fetchItemRatings("items/" + itemID)
      .then((fetchedRatings: Rating[]) => {
        setRatings(fetchedRatings);
      })
      .catch((error) => setError("Failed to fetch item ratings."));
  }, [itemID, user]);

  const handleSendMessage = async () => {
    if (item && user) {
      try {
        console.log(item.userId, message);
        await sendMessage(item.userId, message);
        setIsModalOpen(false);
        nav("/messages");
      } catch (error) {
        setError("Failed to send message.");
      }
    }
  };

  function toTitleCaseWithSpaces(str: string) {
    return str
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/^./, (firstChar) => firstChar.toUpperCase());
  }

  return (
    <div className="pb-16">
      <Header />
      <div className="container mx-auto mt-4 mb-4">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="flex flex-wrap lg:flex-nowrap">
          <div
            className="relative w-full lg:w-3/4"
            style={{ overflow: "hidden" }}
          >
            <div className="carousel">
              {item?.attachments?.map((attachment, index) => (
                <div
                  id={`slide${index}`}
                  className="carousel-item w-full"
                  key={index}
                >
                  <img
                    src={attachment}
                    alt={`Slide ${index}`}
                    className="object-contain h-full w-full"
                  />
                </div>
              ))}
            </div>
            {/* Navigation Buttons */}
            <div className="flex justify-center w-full gap-2">
              <div className="flex justify-center w-full gap-2 overflow-x-auto">
                {item?.attachments?.map((attachment, index) => (
                  <a
                    href={`#slide${index}`}
                    className="carousel-thumb"
                    key={index}
                  >
                    <img
                      src={attachment}
                      alt={`Thumbnail ${index}`}
                      className="object-cover h-16 w-16 rounded-lg shadow-lg"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Item Details Section */}
          <div className="w-full lg:w-1/4 pl-0 lg:pl-4 mt-4 lg:mt-0">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {item?.title}
                </h2>
                <RatingRow
                  key={avgRating}
                  avgRating={avgRating}
                  numRatings={numRatings}
                  className="mb-2"
                />
                {item?.createdAt && (
                  <p className="text-sm text-gray-500 mb-4">
                    Posted on {new Date(item.createdAt).toLocaleDateString()} at{" "}
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                )}

                <p className="text-gray-700 mb-4">{item?.description}</p>

                {owner && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="shrink-0">
                      <ProfilePictureOrInitial user={owner} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {owner.name}
                      </h3>
                    </div>
                  </div>
                )}

                {Object.entries(item?.attributes || {}).some(
                  ([, value]) => value
                ) && (
                  <div className="mb-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-2">
                      Details
                    </h4>
                    <div className="border-t border-gray-200">
                      {Object.entries(item?.attributes || {})
                        .filter(([, value]) => value)
                        .map(([key, value], idx) => (
                          <div
                            key={idx}
                            className="py-2 flex justify-between items-center"
                          >
                            <span className="text-gray-600">
                              {toTitleCaseWithSpaces(key)}
                            </span>
                            <span className="text-gray-900">
                              {Array.isArray(value) ? value.join(", ") : value}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {!isItemOwner && user && (
                  <button
                    className="btn btn-primary w-full"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Contact Owner
                  </button>
                )}

                {!isItemOwner && !user && (
                  <button
                    className="btn btn-primary w-full"
                    onClick={() => {
                      nav("/login");
                    }}
                  >
                    Login to Contact Owner
                  </button>
                )}

                {isItemOwner && (
                  <>
                    <button className="btn btn-secondary mr-2">Edit</button>
                    <button
                      onClick={() => {
                        deleteItem(item?.id || "")
                          .then(() => {
                            // Redirect to the home page after successful deletion
                            nav("/");
                          })
                          .catch((e) => {
                            if (
                              e.response &&
                              e.response.data &&
                              e.response.data.error
                            ) {
                              setError(e.response.data.error);
                              return;
                            }
                            setError("An error occurred. Please try again.");
                          });
                      }}
                      className="btn btn-error"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal for sending a message */}
        {isModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Contact Owner</h3>
              <textarea
                className="textarea textarea-bordered w-full mt-4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="modal-action">
                <button className="btn btn-primary" onClick={handleSendMessage}>
                  Send Message
                </button>
                <button className="btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ratings */}
        <div className="mt-8">
          <Ratings
            ratings={ratings || []}
            recipientID={item?.id}
            recipientIsItem={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ItemPage;
