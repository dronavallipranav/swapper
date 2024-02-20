import React, { useEffect, useRef, useState, useCallback } from "react";
import { Item, Attributes} from "../models/Item";
import { fetchAllItems } from "../services/ItemService";
import CitySearchComponent from "../components/CitySearch";
import { Location } from "../services/LocationService";
import AttributeSelector from "../components/AttributeSelect";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';

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
  const [search, setSearch] = useState<string>("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
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

  const fetchItemsDebounced = useCallback(debounce((query) => {
    
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
      attributes: attributes
    })
    .then(fetchedItems => {
      setItems(fetchedItems);
    })
    .catch(error => {
      console.error(error);
    });
  }, 300), [search, selectedCategory, selectedRadius, location, attributes]); //dependencies for the debounced function

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
    <div className="flex flex-col lg:flex-row">
      <div className={`siderbar lg:block ${isFilterVisible ? "block" : "hidden"} lg:w-1/4 xl:w-1/5 bg-white p-4 lg:sticky lg:top-0 lg:h-screen overflow-y-hidden hover:overflow-y-auto border-2 border-base-200`}>
        {/* Dynamically display the selected category or "Filters" */}
        <h1 className="text-xl lg:text-4xl font-bold mb-6">{selectedCategory !== "All" ? selectedCategory : "Filters"}</h1>
        <input
          type="text"
          placeholder="Search for items..."
          className="input input-bordered input-lg w-full mb-4"
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              className={`btn ${selectedCategory === category ? "btn-primary" : "btn-outline"} rounded-full hover:shadow-lg`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <CitySearchComponent
          messageText=""
          storeLocation={true}
          onChange={(l) => setLocation(l)}
        />
        <div className="flex items-center gap-2 my-4">
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
        <AttributeSelector onAttributesChange={updateAttributes} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-6 py-4 gap-6 xl:grid-cols-4 justify-items-center">
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
    </div>
  );
                      }

export default HomePage;
