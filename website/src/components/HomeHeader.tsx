import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfilePictureOrInitial from './ProfilePictureOrInitial';
import CitySearchComponent from './CitySearch';
import { Location } from "../services/LocationService";

interface HeaderProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  location: Location | undefined; // Adjust type as necessary
  setLocation: (location: Location | undefined) => void;
  selectedRadius: number;
  setSelectedRadius: React.Dispatch<React.SetStateAction<number>>;
  isFilterVisible: boolean;
  setIsFilterVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const HomeHeader: React.FC<HeaderProps> = ({
  search,
  setSearch,
  location,
  setLocation,
  selectedRadius,
  setSelectedRadius,
  isFilterVisible,
  setIsFilterVisible,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="bg-base-100 border-2 border-base-200 px-4 py-2">
      <div className="flex justify-between items-center">
        {/* Left Section: Logo and Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          <button className="btn btn-ghost lg:hidden" onClick={toggleMenu}>
            {/* SVG Icon */}
          </button>
          <Link to="/" className="btn btn-ghost normal-case text-xl">Swapper</Link>
        </div>

        {/* Right Section: Desktop Links and Profile/User Menu */}
        <div className="flex items-center space-x-4">
          {/* Desktop Links */}
          <div className="hidden lg:flex space-x-4">
            <Link to="/about" className="btn btn-ghost normal-case text-xl">About</Link>
            {isAuthenticated && (
              <>
                <Link to="/messages" className="btn btn-ghost normal-case text-xl">Messages</Link>
                <Link to="/items/create" className="btn btn-ghost normal-case text-xl">List Item</Link>
              </>
            )}
          </div>

          {/* Profile/User Menu */}
          {isAuthenticated && user ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <ProfilePictureOrInitial user={user} />
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/logout">Logout</Link></li>
              </ul>
            </div>
          ) : (
            <div className="hidden lg:flex space-x-4">
              <Link to="/login" className="btn btn-ghost normal-case text-xl">Login</Link>
              <Link to="/register" className="btn btn-ghost normal-case text-xl">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Additional adjustments for mobile menu and overlay */}
      <div className={`fixed inset-y-0 left-0 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} transition duration-300 ease-in-out bg-white shadow-md lg:hidden`}>
        {/* Mobile navigation */}
      </div>
      {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" onClick={toggleMenu}></div>}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-4">
        {/* Combined Search Field */}
        <div className="flex items-center gap-2 w-full max-w-4xl">
          {/* Main Search Field */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for items..."
            className="input input-bordered flex-grow rounded-l-full"
          />

          {/* Vertical Separator */}
          <div className="px-2">|</div>

          {/* CitySearchComponent */}
          <CitySearchComponent
            messageText=""
            storeLocation={true}
            onChange={(l: Location): void => setLocation(l)}
          />

          {/* Vertical Separator */}
          <div className="px-2">|</div>

          {/* Search Radius Input */}
          <input
            type="number"
            value={selectedRadius}
            onChange={(e) => setSelectedRadius(Number(e.target.value))}
            className="input input-bordered w-24"
            placeholder="Radius"
            min="1"
          />
          <button
          className="btn btn-primary"
          onClick={() => setIsFilterVisible(!isFilterVisible)}
        >
          All Filters
        </button>
          {/* If you have a button or icon to trigger search, it can go here, with rounded-r-full to complement the rounded left of the search input */}
        </div>
      </div>
    </div>
    
    
  );
};

export default HomeHeader;
