import React, { useState } from "react";
import { createItem } from "../../services/ItemService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const NewItemPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [categories, setCategories] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const item = {
      id: "", 
      userId: "",
      title,
      description,
      quantity: Number(quantity),
      categories: categories.split(",").map((cat) => cat.trim()),
      status,
    };


      createItem(item).then((id) => {
        setError("");
        // Redirect to the item's page after successful creation
        nav(`/${id}`);
      }).catch((e) => {
        if (e.response.data.error) {
          setError(e.response.data.error);
          return;
        }
        setError("An error occurred. Please try again.");
      })
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Create New Item</h3>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4">
          <div>
            <label htmlFor="title" className="block">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 mt-2 border rounded-md" required />
          </div>
          <div className="mt-4">
            <label htmlFor="description" className="block">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 mt-2 border rounded-md" required />
          </div>
          <div className="mt-4">
            <label htmlFor="quantity" className="block">Quantity</label>
            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} className="w-full px-4 py-2 mt-2 border rounded-md" required />
          </div>
          <div className="mt-4">
            <label htmlFor="categories" className="block">Categories (comma-separated)</label>
            <input type="text" id="categories" value={categories} onChange={(e) => setCategories(e.target.value)} className="w-full px-4 py-2 mt-2 border rounded-md" />
          </div>

          <div className="flex justify-end mt-6">
            <button type="submit" className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700">Create Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};
