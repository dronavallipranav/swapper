import { useContext, useState } from "react";
import { login } from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const { loginUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({ email, password })
      .then((user) => {
        loginUser(user);
        nav("/"); // Redirect to home page on successful login
      })
      .catch((e) => {
        console.log(e);
        if (e.response.data.error) {
          setError(e.response.data.error);
          return;
        }
        setError("An error occurred. Please try again.");
      });
  };

  return (
    <div>
      <Header />
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">
          Login to your account
        </h3>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 mt-2 border rounded-md"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 mt-2 border rounded-md"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default LoginPage;
