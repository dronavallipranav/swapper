import React, { useEffect, useState } from "react";
import { Item } from "../models/Item";
import { fetchAllItems } from "../services/ItemService";
import CitySearchComponent from "../components/CitySearch";
import { Location } from "../services/LocationService";
import AttributeSelector from "../components/AttributeSelect";

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
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [location, setLocation] = useState<Location>();
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    fetchAllItems({
      latitude: location?.latitude || 43.0731,
      longitude: location?.longitude || -89.4012,
      radius: selectedRadius,
      categories: selectedCategory !== "All" ? [selectedCategory] : [],
      status: "available",
      limit: 500,
      skip: 0,
      sort: "title",
      order: "asc",
      search: "",
    })
      .then((fetchedItems) => {
        setItems(fetchedItems);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [selectedCategory, selectedRadius, location]);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-6">
        Community Marketplace
      </h1>
      <p className="text-lg text-center mb-8">
        A place to give and find free items, reducing waste and helping each
        other.
      </p>

      <CitySearchComponent
        messageText="Enter a city:"
        storeLocation={true}
        onChange={(l: Location): void => setLocation(l)}
      />

      <div className="flex flex-col md:flex-row justify-center mb-10 items-center gap-4">
        <label className="label">
          <span className="label-text">Search Radius (miles):</span>
        </label>
        <input
          type="number"
          value={selectedRadius}
          onChange={(e) => setSelectedRadius(Number(e.target.value))}
          className="input input-bordered w-full max-w-xs"
          min="1"
        />
        <button
          className="btn btn-primary"
          onClick={() => setIsFilterVisible(!isFilterVisible)}
        >
          Filter
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-center mb-10 items-center gap-4">
        <input
          type="text"
          placeholder="Search for items or categories..."
          className="input input-bordered input-lg w-full max-w-md"
        />
        <div className="hidden md:block">
          <div className="tabs tabs-boxed justify-center">
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
              className={`tab ${
                selectedCategory === "All" ? "tab-active" : ""
              }`}
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

      <div
        className={`fixed inset-0 z-40 transform ${
          isFilterVisible
            ? "translate-x-0"
            : "-translate-x-full md:-translate-x-full"
        } transition-transform ease-in-out duration-300 ${
          isFilterVisible ? "w-full md:w-64" : "w-0"
        } bg-white shadow-xl overflow-hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => setIsFilterVisible(false)}
            className="btn btn-square btn-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-col h-full">
          <div className="overflow-y-auto p-4 flex-grow pb-16">
            <AttributeSelector />
          </div>
          <div className="p-4 bg-white sticky bottom-0 shadow-inner">
            <button
              className="btn btn-primary w-full"
              onClick={() => setIsFilterVisible(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:grid-cols-4 justify-items-center">
        {items &&
          items.map((item) => (
            <div
              key={item.id}
              className="card card-compact w-full md:w-75 bg-base-100 shadow-xl"
            >
              {item.attachments && item.attachments[0] && (
                <figure>
                  <img
                    src={item.attachments[0]}
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
