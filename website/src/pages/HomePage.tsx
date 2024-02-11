import { useEffect, useState } from "react";
import { Item } from "../models/Item";
import { fetchAllItems } from "../services/ItemService";

const categories = ["Electronics", "Clothing", "Toys", "Home and Garden", "Sports", "Books", "Other"];

function HomePage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchAllItems().then((items) => {
      setItems(items);
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
        <div className = "flex justify-center">
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
        className={`tab ${selectedCategory === category ? "tab-active" : ""}`}
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
                      window.location.href = `/item/${item.id}`;
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
