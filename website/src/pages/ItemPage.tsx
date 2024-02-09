import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Item } from '../models/Item'; // Ensure this path matches your project structure
import { fetchItemById } from '../services/ItemService'; // Ensure this path matches your project structure

const ItemPage = () => {
  let { itemID } = useParams();
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    if (!itemID) return;
    fetchItemById(itemID).then((fetchedItem) => {
      setItem(fetchedItem);
    });
  }, [itemID]); // Adding itemID as a dependency for useEffect

  if (!item) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 mt-8">
      <div className="max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden bg-base-200">
        <div className="bg-cover bg-center h-56 p-4" style={{ backgroundImage: `url(${item.imageUrl})` }}>
          {
            item.categories && (
              <div className="flex justify-end">
              <span className="badge badge-ghost badge-lg">Categories: {
                item.categories.map((category, _) => (
                  <span key={category} className="badge badge-ghost badge-lg">{category}</span>
                ))
              
              }</span>
            </div>
            )
          }
        </div>
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
          <p className="text-gray-700 mb-4">{item.description}</p>
          <div className="flex justify-between items-center">
            <button className="btn btn-primary">Contact Owner</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemPage;
