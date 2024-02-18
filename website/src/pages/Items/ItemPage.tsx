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

  useEffect(() => {
    if (!itemID) return;
    fetchItemById("items/" + itemID).then((fetchedItem) => {
      setItem(fetchedItem);
      if (user !== null && fetchedItem.userId === user.id) {
        setIsItemOwner(true);
      }
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
  const handleNavigate = () => {
    sendMessage(item.userId, `Hi, I'm interested in your ${item.title}`).then((id: string) => {
      nav(`/messages/${encodeURIComponent(id)}`);
    }).catch((e) => {
      if (
        e.response &&
        e.response.data &&
        e.response.data.error
      ) {
        setError(e.response.data.error);
        return;
      }
      setError("An error occurred. Please try again.");
    })
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
          <div className="flex flex-wrap justify-center mt-4">
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
                    {item?.attachments?.length && item?.attachments?.length > 1 && <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
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
                    </div>}
                  </div>
                ))}
            </div>
          </div>

          <h2 className="card-title">{item.title}</h2>
          <p>{item.description}</p>
          <div className="card-actions justify-end">
            {!isItemOwner && <button className="btn btn-primary" onClick={handleNavigate}>Contact Owner</button>}
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
        </div>
      </div>
    </div>
  );
};

export default ItemPage;
