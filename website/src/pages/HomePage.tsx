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
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const selectedCategories = selectedCategory !== "All" ? [selectedCategory] : [];
    fetchAllItems({
      latitude: 43.0731, // Default to Madison, WI latitude
      longitude: -89.4012, // Default to Madison, WI longitude
      radius: 100000, // Example radius in miles
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
  }, [selectedCategory]); // React to changes in selectedCategory

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-6">Community Marketplace</h1>
      <p className="text-lg text-center mb-8">
        A place to give and find free items, reducing waste and helping each other.
      </p>

      {/* Search and category selection */}
      <div className="flex flex-col md:flex-row justify-center mb-10 items-center gap-4">
        <input
          type="text"
          placeholder="Search for items or categories..."
          className="input input-bordered input-lg w-full max-w-md"
        />
        {/* Responsive category selector */}
        <div className="hidden md:block">
          <div className="tabs tabs-boxed justify-center">
            {categories.map((category) => (
              <a
                key={category}
                className={`tab ${selectedCategory === category ? "tab-active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </a>
            ))}
            <a
              className={`tab ${selectedCategory === "All" ? "tab-active" : ""}`}
              onClick={() => setSelectedCategory("All")}
            >
              All
            </a>
          </div>
        </div>
        <div className="md:hidden">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="select select-bordered w-full max-w-md"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:grid-cols-4 justify-items-center">
        {items && items.map((item) => (
          <div key={item.id} className="card card-compact w-full md:w-80 bg-base-100 shadow-xl">
            {item.attachments && item.attachments[0] && (
              <figure>
                <img src={`${item.attachments[0]}`} alt="Item" className="rounded-xl" />
              </figure>
            )}
            <div className="card-body">
              <h2 className="card-title">{item.title}</h2>
              <p>{item.description}</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => { window.location.href = `/${item.id}`; }}>
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
