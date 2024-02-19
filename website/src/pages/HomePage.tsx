import React, { useEffect, useRef, useState } from "react";
import { Item } from "../models/Item";
import { fetchAllItems } from "../services/ItemService";
import CitySearchComponent from "../components/CitySearch";
import { Location } from "../services/LocationService";
import AttributeSelector from "../components/AttributeSelect";
import { useNavigate } from "react-router-dom";

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
  const attributeSelectorRef = useRef(null);
  const nav = useNavigate();

  const handleClickOutside = (event: React.MouseEvent | MouseEvent) => {
    // check if its a child of the attributeSelectorRef,
    // if it is a click on the attributeSelectorRef we should stop propagation
    //if (attributeSelectorRef.current && !(attributeSelectorRef.current as Node).contains(event.target as Node)) {
    //  setIsFilterVisible(false);
    //}
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <input
          type="text"
          placeholder="Search for items..."
          className="input input-bordered input-lg w-full max-w-lg mx-auto"
        />
      </div>

      <div className="flex flex-col md:flex-row justify-center mb-10 items-center gap-4 mt-4">
        <div className="flex items-center">
          <label className="label text-sm md:text-base">
            <span className="label-text">In Region:</span>
          </label>
          <CitySearchComponent
            messageText=""
            storeLocation={true}
            onChange={(l: Location): void => setLocation(l)}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="label text-sm md:text-base">
            <span className="label-text">Search Radius (miles):</span>
          </label>
          <input
            type="number"
            value={selectedRadius}
            onChange={(e) => setSelectedRadius(Number(e.target.value))}
            className="input input-bordered w-full w-24"
            min="1"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsFilterVisible(!isFilterVisible)}
        >
          All Filters
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 transform ${
          isFilterVisible ? "translate-x-0" : "-translate-x-full"
        } transition-transform ease-in-out duration-300 ${
          isFilterVisible ? "w-full md:w-64" : "w-0"
        } bg-white shadow-xl overflow-hidden`}
        ref={attributeSelectorRef}
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
              className="card card-compact w-full md:w-75 bg-base-100 shadow-xl hover:scale-110 cursor-pointer transform transition-transform"
              onClick={() => {
                nav(`/${item.id}`)
              }}
            >
              {item.attachments && item.attachments[0] && (
                <figure>
                  <img src={item.attachments[0]} alt="Item" />
                </figure>
              )}

              <div className="card-body mt-[-8px]">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {item.title}
                  </h2>
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
            </div>
          ))}
      </div>
    </div>
  );
}

export default HomePage;
