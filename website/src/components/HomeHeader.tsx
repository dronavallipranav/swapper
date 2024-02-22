import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ProfilePictureOrInitial from "./ProfilePictureOrInitial";
import CitySearchComponent from "./CitySearch";
import { Location } from "../services/LocationService";
import ElectronicsIcon from "../assets/Electronics.svg";
import ClothingIcon from "../assets/Clothing.svg";
import BooksIcon from "../assets/Books.svg";
import HomeGardenIcon from "../assets/Garden.svg";
import CarIcon from "../assets/Car.svg";
import SportsIcon from "../assets/Sports.svg";
import ToysIcon from "../assets/Toys.svg";
import { fetchItemAttributes } from "../services/ItemService";
import Logo from '../assets/Swapper.svg';

interface HeaderProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  location: Location | undefined; // Adjust type as necessary
  setLocation: (location: Location | undefined) => void;
  selectedRadius: number;
  setSelectedRadius: React.Dispatch<React.SetStateAction<number>>;
  isFilterVisible: boolean;
  setIsFilterVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
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
  selectedCategories,
  setSelectedCategories,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="bg-base-100 border-2 border-base-200 px-4 py-2 pb-4">
      <div className="flex justify-between items-center">
        {/* Left Section: Logo and Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          <button className="btn btn-ghost lg:hidden" onClick={toggleMenu}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          <Link to="/" className="btn btn-ghost md:pl-6 normal-case text-sky-500 text-xl">
          <img src={Logo} alt="Logo" className="w-6 h-6 mr-1" />
            Swapper
          </Link>
        </div>

        {/* Sidebar Menu for Mobile */}
        <div
          className={`fixed inset-y-0 left-0 transform ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } w-64 z-20 transition duration-300 ease-in-out bg-white shadow-md lg:hidden`}
        >
          <div className="p-5">
            <Link to="/about" className="block py-2">
              About
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/messages" className="block py-2">
                  Messages
                </Link>
                <Link to="/items/create" className="block py-2">
                  List Item
                </Link>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="block py-2">
                  Login
                </Link>
                <Link to="/register" className="block py-2">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Section: Desktop Links and Profile/User Menu */}
        <div className="flex items-center space-x-4">
          {/* Desktop Links */}
          <div className="hidden lg:flex space-x-4">
            <Link to="/about" className="btn btn-ghost normal-case text-xl">
              About
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/messages"
                  className="btn btn-ghost normal-case text-xl"
                >
                  Messages
                </Link>
                <Link
                  to="/items/create"
                  className="btn btn-ghost normal-case text-xl"
                >
                  List Item
                </Link>
              </>
            )}
          </div>

          {/* Profile/User Menu */}
          {isAuthenticated && user ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <ProfilePictureOrInitial user={user} />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link to={`/profile/${encodeURIComponent(user.id)}`}>Profile</Link>
                </li>
                <li>
                  <Link to="/logout">Logout</Link>
                </li>
              </ul>
            </div>
          ) : (
            <div className="hidden lg:flex space-x-4">
              <Link to="/login" className="btn btn-ghost normal-case text-xl">
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-ghost normal-case text-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition duration-300 ease-in-out bg-white shadow-md lg:hidden`}
      ></div>
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={toggleMenu}
        ></div>
      )}
      {/* Adjusted Combined Search Field for Mobile Optimization */}
      <div className="md:hidden flex flex-col items-center gap-2 w-full px-4 pt-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for items..."
          className="bg-white rounded-full shadow w-full px-4 py-2 focus:outline-none"
        />

        <div className="flex flex-col items-center gap-2 w-full">
          <div className="w-full flex justify-between px-4 py-2 bg-white rounded-full shadow">
            <label className="text-sm font-semibold">Region:</label>

            <CitySearchComponent
              messageText=""
              storeLocation={true}
              onChange={(l: Location): void => setLocation(l)}
            />
          </div>
          <div className="w-full flex justify-between px-4 py-2 bg-white rounded-full shadow">
            <label className="text-sm font-semibold">Radius (miles):</label>
            <input
              type="number"
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(Number(e.target.value))}
              className="bg-transparent focus:outline-none"
              placeholder="Radius"
              min="1"
            />
          </div>
        </div>

        <button
          className="text-white bg-sky-500 hover:bg-sky-600 focus:outline-none rounded-lg px-4 py-2"
          onClick={() => setIsFilterVisible(!isFilterVisible)}
        >
          All Filters
        </button>
      </div>
      <div className="hidden mt-4 md:flex justify-center items-center gap-2 w-full px-4">
        <div className="flex items-center bg-white hover:bg-gray-50 rounded-full shadow w-full max-w-4xl flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for items..."
            className="flex-grow bg-transparent pl-4 focus:outline-none rounded-l-full"
          />

          <div className="flex items-center w-full md:w-auto px-4 py-2">
            <label className="text-sm font-semibold mr-2">Region:</label>
            <CitySearchComponent
              messageText=""
              storeLocation={true}
              onChange={(l: Location): void => setLocation(l)}
            />
          </div>

          <span className="hidden md:block text-gray-400 mx-2">|</span>

          <div className="flex items-center w-full md:w-auto px-4 py-2">
            <label className="text-sm font-semibold mr-2">
              Radius (miles):
            </label>
            <input
              type="number"
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(Number(e.target.value))}
              className="bg-transparent focus:outline-none w-full md:w-24"
              placeholder="Radius"
              min="1"
            />
          </div>

          <button
            className="ml-4 mr-4 text-white bg-sky-500 hover:bg-sky-600 focus:outline-none rounded-lg px-4 py-2 flex-shrink-0"
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;
