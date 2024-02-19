import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="flex justify-between items-center bg-base-100 px-4 py-2">
      <div className="flex items-center">
        <button className="btn btn-ghost lg:hidden" onClick={toggleMenu}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Swapper
        </Link>
        
        {/* Sidebar Menu for Desktop */}
        <div className="hidden lg:flex">
          <Link to="/about" className="btn btn-ghost normal-case text-xl">About</Link>
          {isAuthenticated && (
            <>
              <Link to="/messages" className="btn btn-ghost normal-case text-xl">Messages</Link>
              <Link to="/items/create" className="btn btn-ghost normal-case text-xl">List Item</Link>
            </>
          )}
          </div>
      </div>

      {/* Sidebar Menu for Mobile */}
      <div className={`fixed inset-y-0 left-0 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} w-64 z-20 transition duration-300 ease-in-out bg-white shadow-md lg:hidden`}>
        <div className="p-5">
          <Link to="/about" className="block py-2">About</Link>
          {isAuthenticated && (
            <>
              <Link to="/messages" className="block py-2">Messages</Link>
              <Link to="/items/create" className="block py-2">List Item</Link>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="block py-2">Login</Link>
              <Link to="/register" className="block py-2">Register</Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center">
        {isAuthenticated && user ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
              <div className="w-10 h-10 rounded-full">
                {user.profilePicture ? (
                  <img src={`${user.profilePicture}`} alt="Profile" className="rounded-full" />
                ) : (
                  <span className="text-xl">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/logout">Logout</Link></li>
            </ul>
          </div>
        ) : (
          <div className="hidden lg:flex">
            <Link to="/login" className="btn btn-ghost normal-case text-xl">Login</Link>
            <Link to="/register" className="btn btn-ghost normal-case text-xl">Register</Link>
          </div>
        )}
      </div>

      {/* Overlay to close the menu */}
      {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" onClick={toggleMenu}></div>}
    </div>
  );
};

export default Header;
