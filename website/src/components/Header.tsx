import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

const Header = () => {
  const { isAuthenticated, user } = useAuth(); // Assuming currentUser is available

  useEffect(() => {

  }, [user])

  return (
    <div className="navbar bg-base-100 flex justify-between">
      <div>
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Swapper
        </Link>
        <Link to="/about" className="btn btn-ghost normal-case text-xl">
          About
        </Link>
        {isAuthenticated && (
          <>
            <Link to="/messages" className="btn btn-ghost normal-case text-xl">
              Messages
            </Link>
            <Link to="/items/create" className="btn btn-ghost normal-case text-xl">
              Create Item
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {(isAuthenticated && user) ? (
          <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost mr-2 btn-circle avatar placeholder cursor-pointer focus:outline-none z-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-base-300">
              {user.profilePicture ? (
                <img src={`data:image/png;base64,${user.profilePicture}`} alt="Profile" className="rounded-full w-full h-full object-cover" />
              ) : (
                <span className="text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </label>
          <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
            <li><Link to="/profile" className="justify-between">Profile</Link></li>
            <li><Link to="/logout" className="justify-between">Logout</Link></li>
          </ul>
        </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost normal-case text-xl">
              Login
            </Link>
            <Link to="/register" className="btn btn-ghost normal-case text-xl">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
