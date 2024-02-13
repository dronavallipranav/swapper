import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Item } from "../../models/Item";
import { deleteItem, fetchItemById } from "../../services/ItemService";
import { useAuth } from "../../contexts/AuthContext";

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

  return (
    <div className="container mx-auto px-4 py-10 mt-8">
      <div className="max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden bg-base-200">
        {/*item.imageUrl && <img src={item.imageUrl} />*/}
        {error && <p className="text-red-500">{error}</p>}
        <div className="bg-cover bg-center p-4">
          {item.categories && (
            <div className="flex justify-end">
              <span className="badge badge-ghost badge-lg">
                Categories:{" "}
                {item.categories.map((category, _) => (
                  <span key={category} className="badge badge-ghost badge-lg">
                    {category}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
          <p className="text-gray-700 mb-4">{item.description}</p>
          <div className="flex justify-between items-center">
            <button className="btn btn-primary">Contact Owner</button>
            {isItemOwner && (
              <div className="flex gap-2">
                <button className="btn btn-ghost">Edit</button>
                <button 
                  onClick={() => {
                    deleteItem(item.id).then(() => {
                      // Redirect to the home page after successful deletion
                      nav("/");
                    }).catch((e) => {
                      if (e.response.data.error) {
                        setError(e.response.data.error);
                        return;
                      }
                      setError("An error occurred. Please try again.");
          
                    })
                  }}
                className="btn btn-error">Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemPage;
