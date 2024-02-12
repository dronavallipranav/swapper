import { useEffect, useState } from "react";
import { Item } from "../models/Item";
import { fetchAllItems } from "../services/ItemService";

const categories = [
  "Electronics",
  "Clothing",
  "Toys",
  "Home and Garden",
  "Sports",
  "Books",
  "Other",
];

function HomePage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchAllItems({
      latitude: 43.0731, // Default to Madison, WI latitude
      longitude: -89.4012, // Default to Madison, WI longitude
      radius: 10, // Example radius in miles
      categories: [], // Example category to filter by
      status: 'available', // Example status to filter by
      limit: 10, // Optional: Default number of items to return
      skip: 0, // Optional: Default number of items to skip
      sort: 'title', // Optional: Default field to sort by
      order: 'asc', // Optional: Default sort order
      search: '', // Optional: Default search term, empty means no search filter
    })
      .then((items) => {
        setItems(items);
      })
      .catch((error) => {
        console.error(error); // Handle potential errors
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-6">
        Community Marketplace
      </h1>
      <p className="text-lg text-center mb-8">
        A place to give and find free items, reducing waste and helping each
        other.
      </p>

      <div className="mb-10">
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search for items or categories..."
            className="input input-bordered input-lg w-full max-w-xs mx-auto"
          />
        </div>
        <div className="tabs tabs-boxed justify-center my-4">
          {categories.map((category) => (
            <a
              key={category}
              className={`tab ${
                selectedCategory === category ? "tab-active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </a>
          ))}
          <a
            className={`tab ${selectedCategory === null ? "tab-active" : ""}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items &&
          items.map((item) => (
            <div key={item.id} className="card w-72 bg-base-100 shadow-xl">
              {/*item.imageUrl && (
                <figure>
                  <img src={item.imageUrl} alt="Item" className="rounded-xl" />
                </figure>
              )*/}
              <div className="card-body items-center text-center">
                <h2 className="card-title">{item.title}</h2>
                <p>{item.description}</p>
                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      window.location.href = `/item/${item.id.replace("items/", "")}`;
                    }}
                  >
                    View Item
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default HomePage;
