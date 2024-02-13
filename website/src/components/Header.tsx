import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { isAuthenticated } = useAuth();

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
            <Link
              to="/item/create"
              className="btn btn-ghost normal-case text-xl"
            >
              Create Item
            </Link>
          </>
        )}
      </div>
      <div>
        {isAuthenticated ? (
          <Link to="/logout" className="btn btn-ghost normal-case text-xl">
            Logout
          </Link>
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
