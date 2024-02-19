import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Item } from "../../models/Item";
import { deleteItem, fetchItemById } from "../../services/ItemService";
import { useAuth } from "../../contexts/AuthContext";
import { sendMessage } from "../../services/MessageService";

const ItemPage = () => {
  let { itemID } = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [isItemOwner, setIsItemOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!itemID) return;
    fetchItemById("items/" + itemID).then((fetchedItem) => {
      setItem(fetchedItem);
      if (user !== null && fetchedItem.userId === user.id) {
        setIsItemOwner(true);
      }
      // Prepopulate the message with a default text
      setMessage(`Hi, I'm interested in your ${fetchedItem.title}`);
    });
  }, [itemID, user]);

  if (!item) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Function to handle navigation
  const handleSendMessage = () => {
    sendMessage(item.userId, message)
      .then((id: string) => {
        setIsModalOpen(false);
        nav(`/messages/${encodeURIComponent(id)}`);
      })
      .catch((e) => {
        if (e.response && e.response.data && e.response.data.error) {
          setError(e.response.data.error);
          return;
        }
        setError("An error occurred. Please try again.");
      });
  };

  return (
    <div className="container mx-auto px-4 py-10 mt-8">
      <div className="card lg:card-side bg-base-200 shadow-xl">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="card-body">
          {item.categories && (
            <div className="badge badge-outline">
              Categories:{" "}
              {item.categories.map((category, index) => (
                <span key={index} className="badge badge-outline mx-1">
                  {category}
                </span>
              ))}
            </div>
          )}
          {/* Images Display Section */}
          <div className="flex flex-wrap justify-center mt-4 mx-auto">
            <div className="carousel w-full">
              {item.attachments &&
                item.attachments.map((base64EncodedImage, index) => (
                  <div
                    id={`slide${index}`}
                    className="carousel-item relative w-full"
                  >
                    <img
                      src={`${base64EncodedImage}`}
                      alt={`Attachment ${index}`}
                      className="rounded-box"
                    />
                    {item?.attachments?.length &&
                      item?.attachments?.length > 1 && (
                        <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                          <a
                            href={
                              `#slide` +
                              (index === 0
                                ? (item.attachments?.length ?? 0) - 1
                                : index - 1)
                            }
                            className="btn btn-circle"
                          >
                            ❮
                          </a>
                          <a
                            href={
                              "#slide" +
                              (index === (item.attachments?.length ?? 0) - 1
                                ? 0
                                : index + 1)
                            }
                            className="btn btn-circle"
                          >
                            ❯
                          </a>
                        </div>
                      )}
                  </div>
                ))}
            </div>
          </div>
          <h2 className="card-title">{item.title}</h2>
          <p>{item.description}</p>
          <div className="card-actions justify-end">
            {!isItemOwner && (
              <button
                className="btn btn-primary"
                onClick={() => setIsModalOpen(true)}
              >
                Contact Owner
              </button>
            )}

            {isModalOpen && (
              <div className="modal modal-open">
                <div className="modal-box">
                  <h3 className="font-bold text-lg">Contact Owner</h3>
                  <textarea
                    className="textarea textarea-bordered w-full mt-4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                  <div className="modal-action">
                    <button
                      className="btn btn-primary"
                      onClick={handleSendMessage}
                    >
                      Send Message
                    </button>
                    <button
                      className="btn"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isItemOwner && (
              <>
                <button className="btn btn-secondary">Edit</button>
                <button
                  onClick={() => {
                    deleteItem(item.id)
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
          
          {/*count the number of values in object, if it is greater than 0, then render the table
            // if not, then don't render the table*/}
          { Object.entries(item.attributes || {}).some(([, value]) => value !== "" && value != null) && (
            <>
            <div className="divider"></div>
            <div className="overflow-x-auto w-full p-4 rounded-xl">
              <table className="table w-full table-zebra">
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Dynamically render item attributes */}
                  {Object.entries(item.attributes || {}).map(
                    ([key, value]) =>
                      value && (
                        <tr key={key}>
                          <td>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                          <td>
                            {Array.isArray(value) ? value.join(", ") : value}
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemPage;
