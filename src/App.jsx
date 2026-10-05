// src/App.js
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";

// --- Context Providers ---
import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";
import { AddressProvider } from "./context/AddressContext";
import { WishlistProvider } from "./context/WishlistContext";
import { OrderProvider } from "./context/OrderContext";
import { useUser } from "./context/UserContext";

// --- Layout ---
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// --- Pages & Components ---
import LandingPage from "./pages/LandingPage";
import CustomerAuth from "./components/auth/CustomerAuth";
import Cart from "./components/product/Cart";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import AddressManager from "./components/Profile/AddressManager";
import OrderHistoryPage from "./components/product/OrderHistoryPage";
import ProductDetailPage from "./components/product/ProductDetailPage";
import EnthiranChat from "./components/common/EnthiranChat";

// --- Global Styles ---
import "./App.css";
import "./styles/Global.css";

// ------------------------------
// APP CONTENT (inside Router)
// ------------------------------

import { setAuthToken } from "./api/api";

const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const token =
  localStorage.getItem("accessToken") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("token");

if (isLoggedIn && token && token !== "undefined" && token !== "null") {
  setAuthToken(token);
}
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <div className="p-20 text-center">Elite Royale: Synchronizing Credentials...</div>;
  return isAuthenticated ? children : null;
};

const AppContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated } = useUser();

  return (
    <div className="min-h-screen bg-transparent font-sans text-gray-900 antialiased flex flex-col">
      {/* HEADER */}
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* MAIN CONTENT */}
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<CustomerAuth />} />
          
          {/* PUBLIC — Browse products, cart, and wishlist without login */}
          <Route path="/" element={<LandingPage searchTerm={searchTerm} />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* PROTECTED — Requires login */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/address" element={<ProtectedRoute><AddressManager /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
        </Routes>
      </main>

      {/* FOOTER */}
      <Footer />

      {/* ENTHIRAN ASSISTANT */}
      <EnthiranChat />
    </div>
  );
};

// ------------------------------
// ROOT APP
// ------------------------------
function App() {
  return (
    <Router>
      <UserProvider>
        <WishlistProvider>
          <CartProvider>
            <AddressProvider>
              <OrderProvider>
                <AppContent />
              </OrderProvider>
            </AddressProvider>
          </CartProvider>
        </WishlistProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
