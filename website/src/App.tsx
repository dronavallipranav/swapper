import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import Footer from "./components/Footer";
import ItemPage from "./pages/ItemPage";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";

import MessagePanel from "./components/MessagePanel";
import MessagePage from "./pages/MessagePage";
function App() {
  return (
    <>
      <div className="min-h-screen">
        <BrowserRouter>
          <div className="navbar bg-base-100">
            <Link to="/" className="btn btn-ghost normal-case text-xl">
              Swapper
            </Link>
            <Link to="/about" className="btn btn-ghost normal-case text-xl">
              About
            </Link>
            <Link to="/messages" className="btn btn-ghost normal-case text-xl">
              Messages
            </Link>
          </div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/item/:itemID" element={<ItemPage />} /> 
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/messages" element={<MessagePage />} /> 
          </Routes>
        </BrowserRouter>
      </div>
      <Footer />
    </>
  );
}

export default App;
