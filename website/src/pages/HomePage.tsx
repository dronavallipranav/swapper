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
      radius: 10000000, // Example radius in miles
      categories: [], // Example category to filter by
      status: "available", // Example status to filter by
      limit: 500, // Optional: Default number of items to return
      skip: 0, // Optional: Default number of items to skip
      sort: "title", // Optional: Default field to sort by
      order: "asc", // Optional: Default sort order
      search: "", // Optional: Default search term, empty means no search filter
    })
      .then((items) => {
        console.log(items);
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

      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search for items or categories..."
          className="input input-bordered input-lg w-full max-w-md" // Adjusted max width for better centering
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {" "}
        {/* Ensure items are centered */}
        {items &&
          items.map((item) => (
            <div
              key={item.id}
              className="card card-compact w-full md:w-80 bg-base-100 shadow-xl"
            >
              {" "}
              {/* Adjusted width for responsive design */}
              {item.attachments && item.attachments[0] && (
                <figure>
                  <img
                    src={`data:image/png;base64,${item.attachments[0]}`}
                    alt="Item"
                    className="rounded-xl"
                  />
                </figure>
              )}
              <div className="card-body">
                <h2 className="card-title">{item.title}</h2>
                <p>{item.description}</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      window.location.href = `/${item.id}`;
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
