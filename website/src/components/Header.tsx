import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfilePictureOrInitial from './ProfilePictureOrInitial';

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="bg-base-100 border-2 border-base-200 px-4 py-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button className="btn btn-ghost lg:hidden" onClick={toggleMenu}>
            {/* SVG Icon */}
          </button>
          <Link to="/" className="btn btn-ghost normal-case text-xl">Swapper</Link>
        </div>

        <div className="flex items-center space-x-4">

          <div className="hidden lg:flex space-x-4">
            <Link to="/about" className="btn btn-ghost normal-case text-xl">About</Link>
            {isAuthenticated && (
              <>
                <Link to="/messages" className="btn btn-ghost normal-case text-xl">Messages</Link>
                <Link to="/items/create" className="btn btn-ghost normal-case text-xl">List Item</Link>
              </>
            )}
          </div>

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

      <div className={`fixed inset-y-0 left-0 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} transition duration-300 ease-in-out bg-white shadow-md lg:hidden`}>
        {/* Mobile navigation */}
      </div>
      {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" onClick={toggleMenu}></div>}
      
    </div>
    
    
  );
};

export default Header;