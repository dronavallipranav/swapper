import React, { useEffect, useRef, useState, useCallback } from "react";
import { Item, Attributes } from "../models/Item";
import { fetchAllItems } from "../services/ItemService";
import { Location } from "../services/LocationService";
import AttributeSelector from "../components/AttributeSelect";
import { useNavigate } from "react-router-dom";
import { debounce, fill } from "lodash";
import HomeHeader from "../components/HomeHeader";
import { filledStar } from "../components/Ratings/StarRating";
import ElectronicsIcon from "../assets/Electronics.svg";
import ClothingIcon from "../assets/Clothing.svg";
import TravelIcon from "../assets/Travel.svg";
import BooksIcon from "../assets/Books.svg";
import HomeGardenIcon from "../assets/Garden.svg";
import CarIcon from "../assets/Car.svg";
import SportsIcon from "../assets/Sports.svg";
import ToysIcon from "../assets/Toys.svg";
import { fetchItemAttributes } from "../services/ItemService";
const HomePage = () => {
  const [items, setItems] = useState<Item[] | null>(null);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const attributeSelectorRef = useRef(null);
  const [attributes, setAttributes] = useState<Record<string, string[]>>({});
  const nav = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);

  const updateAttributes = (newAttributes: Record<string, string[]>) => {
    // update the selected categories
    setSelectedCategories(newAttributes.itemCategories || []);
    setAttributes(newAttributes);
  };

  const categoryIcons: Record<string, string> = {
    Electronics: ElectronicsIcon,
    Clothing: ClothingIcon,
    Books: BooksIcon,
    "Home And Garden": HomeGardenIcon,
    Sports: SportsIcon,
    Toys: ToysIcon,
    Automotive: CarIcon,
    Travel: TravelIcon
  };

  function toTitleCaseWithSpaces(str: string) {
    return str
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/^./, (firstChar) => firstChar.toUpperCase());
  }
  useEffect(() => {
    fetchItemAttributes()
      .then((attributes) => {
        setCategories(["All", ...attributes.itemCategory]);
      })
      .catch((e) => {});
  }, []);

  /*useEffect(() => {
    setAttributes((prev) => {
      if (selectedCategories.includes("All")) {
        return { ...prev, itemCategory: [] };
      }

      // Extract itemCategory from previous attributes
      const { itemCategory: prevItemCategory = [] } = prev;

      // Combine previous itemCategory with selectedCategories, ensuring uniqueness
      const combinedCategories = Array.isArray(selectedCategories)
        ? [...new Set([...prevItemCategory, ...selectedCategories])]
        : prevItemCategory;

      // Return the updated attributes only if there's a change
      if (
        combinedCategories.length !== prevItemCategory.length ||
        !combinedCategories.every(
          (val, index) => val === prevItemCategory[index]
        )
      ) {
        return { ...prev, itemCategory: combinedCategories };
      }

      // If there's no change, return previous attributes to avoid unnecessary re-renders
      return prev;
    });
  }, [selectedCategories, setAttributes]);*/

  useEffect(() => {
    setAttributes((prev) => {
      // If "All" is selected, reset itemCategory to an empty array
      if (selectedCategories.includes("All")) {
        return { ...prev, itemCategory: [] };
      }
  
      // Since we now want to ensure only one category can be selected (excluding "All"),
      // we select the first category from selectedCategories that is not "All",
      // or maintain the current itemCategory if no new category is selected.
      const newCategory = selectedCategories.find((category) => category !== "All");
  
      // Extract itemCategory from previous attributes
      const { itemCategory: prevItemCategory = [] } = prev;
  
      // If there's a new category and it's different from the current one, update it.
      // Otherwise, keep the previous itemCategory. This check prevents unnecessary re-renders.
      if (newCategory && (!prevItemCategory.length || newCategory !== prevItemCategory[0])) {
        return { ...prev, itemCategory: [newCategory] };
      }
  
      // If there's no new selection or no change, return previous attributes
      return prev;
    });
  }, [selectedCategories, setAttributes]);
  

  
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
        categories: [],
        status: "available",
        limit: 40,
        skip: page * 40,
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
    [search, selectedRadius, location, attributes, page]
  ); //dependencies for the debounced function

  useEffect(() => {
    fetchItemsDebounced({ search });
  }, [fetchItemsDebounced]); //call the debounced function when the search changes

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
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
      <div className="container mx-auto px-4 pt-4">
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

        <div className="flex justify-center pb-5 flex-wrap gap-2">
        {/* Ignore categories without buttons mapped to them */}
        {categories &&
          categories.map(
            (category, index) =>
              (categoryIcons[toTitleCaseWithSpaces(category)] ||
                category == "All") && (
                <button
                  key={index}
                  className={`btn ${
                    selectedCategories && selectedCategories.includes(category)
                      ? "btn-active"
                      : ""
                  }`}
                  onClick={() => {
                    const isSelected = selectedCategories.includes(category);
                    if (isSelected) {
                      // Remove the category from the selection
                      setSelectedCategories(
                        selectedCategories.filter((c) => c !== category)
                      );
                    } else {
                      // Add the category to the selection
                      // if we've selected "All", clear the selection and select only "All"
                      setSelectedCategories([category]);
                      return;

                      if (category === "All") {
                        setSelectedCategories(["All"]);
                      } else if (selectedCategories.includes("All")) {
                        setSelectedCategories([category]);
                      } else {
                        // we need to make sure the result ends as unique
                        // so we don't have duplicate categories in the selection
                        setSelectedCategories([
                          ...selectedCategories,
                          category,
                        ]);
                      }
                    }
                  }}
                >
                  {categoryIcons[toTitleCaseWithSpaces(category)] ? (
                    <img
                      src={categoryIcons[toTitleCaseWithSpaces(category)]}
                      alt={category}
                      className="w-4 h-4 mr-2"
                    />
                  ) : null}
                  {toTitleCaseWithSpaces(category)}
                </button>
              )
          )}
      </div>

        {items && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:grid-cols-4 justify-items-center">
            {items.map((item) => (
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
        )}

        {items && items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No items found
            </h2>
            <p className="text-gray-600">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => {
                if (page === 0) return;
                setPage(page - 1);
              }}
            >
              «
            </button>
            <button className="join-item btn">Page {page + 1}</button>
            <button
              className="join-item btn"
              onClick={() => {
                setPage(page + 1);
              }}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
