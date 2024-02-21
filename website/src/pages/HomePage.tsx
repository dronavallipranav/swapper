import React, { useEffect, useRef, useState, useCallback } from "react";
import { Item, Attributes } from "../models/Item";
import { fetchAllItems } from "../services/ItemService";
import { Location } from "../services/LocationService";
import AttributeSelector from "../components/AttributeSelect";
import { useNavigate } from "react-router-dom";
import { debounce, fill } from "lodash";
import HomeHeader from "../components/HomeHeader";
import { filledStar } from "../components/Ratings/StarRating";

const HomePage = () => {
  const [items, setItems] = useState<Item[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const attributeSelectorRef = useRef(null);
  const [attributes, setAttributes] = useState<Record<string, string[]>>({});
  const nav = useNavigate();

  const updateAttributes = (newAttributes: Record<string, string[]>) => {
    setAttributes(newAttributes);
  };

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

  const fetchItemsDebounced = useCallback(
    debounce((query) => {
      fetchAllItems({
        ...query,
        latitude: location?.latitude || 43.0731,
        longitude: location?.longitude || -89.4012,
        radius: selectedRadius,
        categories: selectedCategory !== "All" ? [selectedCategory] : [],
        status: "available",
        limit: 500,
        skip: 0,
        sort: "title",
        order: "asc",
        search: search,
        attributes: attributes,
      })
        .then((fetchedItems) => {
          setItems(fetchedItems);
        })
        .catch((error) => {
          console.error(error);
        });
    }, 300),
    [search, selectedCategory, selectedRadius, location, attributes]
  ); //dependencies for the debounced function

  useEffect(() => {
    fetchItemsDebounced({ search });
  }, [fetchItemsDebounced]); //call the debounced function when the search changes

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <div>
      <HomeHeader
        search={search}
        setSearch={setSearch}
        location={location}
        setLocation={setLocation}
        selectedRadius={selectedRadius}
        setSelectedRadius={setSelectedRadius}
        isFilterVisible={isFilterVisible}
        setIsFilterVisible={setIsFilterVisible}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <div className="container mx-auto px-4 py-10">
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

          <AttributeSelector onAttributesChange={updateAttributes} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:grid-cols-4 justify-items-center">
          {items &&
            items.map((item) => (
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
      </div>
    </div>
  );
};

export default HomePage;
