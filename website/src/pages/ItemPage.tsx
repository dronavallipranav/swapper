import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Item } from '../models/Item';


const ItemPage = () => {
  let { itemID } = useParams(); // Use useParams to access the itemID parameter
    const [item, setItem] = useState<Item | null>(null);

    useEffect(() => {
    })


  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold">Item Details</h1>
      <p className="text-lg mt-4">Displaying details for item ID: {itemID}</p>
      {/* Render your item details here */}
    </div>
  );
};

export default ItemPage;
