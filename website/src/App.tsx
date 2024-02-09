import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import Footer from "./components/Footer";
import ItemPage from "./pages/ItemPage";

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
          </div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/item/:itemID" element={<ItemPage />} /> 
          </Routes>
        </BrowserRouter>
      </div>
      <Footer />
    </>
  );
}

export default App;
