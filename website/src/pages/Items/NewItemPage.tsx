import React, { useEffect, useRef, useState } from "react";
import { createItem, fetchItemAttributes } from "../../services/ItemService";
import { useNavigate } from "react-router-dom";
import { Location } from "../../services/LocationService";
import CitySearchComponent from "../../components/CitySearch";
import Header from "../../components/Header";
export const NewItemPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [categories, setCategories] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [itemLocation, setItemLocation] = useState<Location | null>(null);
  const [attributes, setAttributes] = useState<Record<string, string[]>>({});
  const [selectedAttributeKey, setSelectedAttributeKey] = useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    fetchItemAttributes().then(setAttributes).catch(console.error);
  }, []);

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImages([...images, e.target.files[0]]);
      e.target.value = "";
    }
  };

  function toTitleCaseWithSpaces(str: string) {
    return str
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/^./, (firstChar) => firstChar.toUpperCase());
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAttributeKeyChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedAttributeKey(e.target.value);
  };

  const handleAttributeValueChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    if (selectedAttributeKey) {
      setSelectedAttributes((prev) => ({
        ...prev,
        [selectedAttributeKey]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("quantity", quantity.toString());
    categories
      .split(",")
      .forEach((cat) => formData.append("categories[]", cat.trim()));
    formData.append("status", status);
    if (itemLocation) {
      formData.append("location", JSON.stringify(itemLocation));
    }
    images.forEach((image) => formData.append("images", image));

    formData.append("attributes", JSON.stringify(selectedAttributes));

    try {
      const id = await createItem(formData);
      setError("");
      nav(`/${id}`);
    } catch (e) {
      setError("An error occurred. Please try again later.");
      console.error(e);
    }
  };

  const handleRemoveSelectedAttribute = (attributeKey: string) => {
    setSelectedAttributes((prev) => {
      const updatedAttributes = { ...prev };
      delete updatedAttributes[attributeKey];
      return updatedAttributes;
    });
  };

  return (
    <div>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full px-8 py-6 mt-4 text-left bg-white shadow-lg sm:w-3/4 md:w-2/3 lg:w-1/2 xl:max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center">List New Item</h3>
          {error && <p className="text-red-500">{error}</p>}
          <form onSubmit={handleSubmit} className="mt-4">
            <div>
              <label htmlFor="title" className="block">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md"
                required
              />
            </div>
            <div className="mt-4">
              <label htmlFor="description" className="block">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md"
                required
              />
            </div>
            <div className="mt-4">
              <label htmlFor="quantity" className="block">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2 mt-2 border rounded-md"
                required
              />
            </div>
            <div className="mt-4">
              <label htmlFor="images" className="block">
                Images
              </label>
              <input
                type="file"
                id="images"
                ref={fileInputRef}
                onChange={handleAddImage}
                className="w-full px-4 py-2 mt-2 border rounded-md hidden"
                accept="image/png, image/jpeg, image/jpg"
              />
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                className="mt-2 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600"
              >
                Add Another Image
              </button>
            </div>

            <div className="mt-4">
              <label className="block">Uploaded Images</label>
              {images.map((file, index) => (
                <div key={index} className="flex items-center mt-2">
                  <span className="mr-2">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="px-2 py-1 text-white bg-red-500 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* where the item is */}
            <div className="mt-4">
              <label htmlFor="location" className="block">
                Location of Item
              </label>

              <CitySearchComponent
                messageText=""
                onChange={(l: Location): void => {
                  setItemLocation(l);
                }}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="attributeType" className="block">
                Attribute Type
              </label>
              <select
                id="attributeType"
                value={selectedAttributeKey}
                onChange={handleAttributeKeyChange}
                className="w-full px-4 py-2 mt-2 border rounded-md"
              >
                <option value="">Select Attribute Type</option>
                {Object.keys(attributes).map((key) => (
                  <option key={key} value={key}>
                    {toTitleCaseWithSpaces(key)}
                  </option>
                ))}
              </select>
            </div>

            {/* Attribute selection logic */}
            {selectedAttributeKey && (
              <div className="mt-4">
                <label htmlFor="attributeValue" className="block">
                  {toTitleCaseWithSpaces(selectedAttributeKey)}
                </label>
                <select
                  id="attributeValue"
                  value={selectedAttributes[selectedAttributeKey] || ""}
                  onChange={handleAttributeValueChange}
                  className="w-full px-4 py-2 mt-2 border rounded-md"
                >
                  <option value="">Select Value</option>
                  {attributes[selectedAttributeKey]?.map((option) => (
                    <option key={option} value={option}>
                      {toTitleCaseWithSpaces(option)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Display selected attributes and remove option */}
            <div className="mt-4">
              {Object.entries(selectedAttributes).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between mt-2 p-2 bg-gray-100 rounded-md"
                >
                  <span>
                    {toTitleCaseWithSpaces(key)}: {toTitleCaseWithSpaces(value)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedAttribute(key)}
                    className="ml-4 px-2 py-1 text-white bg-red-500 rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-sky-500 rounded-md hover:bg-sky-600 focus:outline-none focus:bg-sky-600"
              >
                List Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
