import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ItemPage from "./pages/Items/ItemPage";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ProfilePage from "./pages/profile/ProfilePage";
import ProfileSettings from "./pages/profile/ProfileSettings";
import MessagePanel from "./components/MessagePanel";
import ConversationsPage from "./pages/ConversationsPage";
import LogoutPage from "./pages/LogoutPage";
import { AuthProvider } from "./contexts/AuthContext";
import { NewItemPage } from "./pages/Items/NewItemPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <div className="min-h-screen">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Main Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Item Routes */}
              <Route
                path="/items/create"
                element={
                  <ProtectedRoute>
                    <NewItemPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/items/:itemID" element={<ItemPage />} />

              {/* Message Routes */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <ConversationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/:userID"
                element={
                  <ProtectedRoute>
                    <MessagePanel />
                  </ProtectedRoute>
                }
              />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/logout" element={<LogoutPage />} />

              {/* Profile Routes */}
              <Route
                path="/profile/:userID"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/settings"
                element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;
