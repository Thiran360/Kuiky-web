// src/App.js
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

// --- Context Providers ---
import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";
import { AddressProvider } from "./context/AddressContext";
import { WishlistProvider } from "./context/WishlistContext";
import { OrderProvider } from "./context/OrderContext";

// --- Components & Pages ---
import Header from "./components/layout/Header";
import LandingPage from "./pages/LandingPage";
import CustomerAuth from "./components/auth/CustomerAuth";
// import ProductListingPage from "./components/product/ProductListingPage";
import Cart from "./components/product/Cart";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import AddressManager from "./components/Profile/AddressManager";
import OrderHistoryPage from "./components/product/OrderHistoryPage";

// Global Styles
import "./styles/Global.css";

// Wrap inside Router so we can use useNavigate + useLocation
const AppContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);

    if (categoryId && location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">

      {/* Global Header */}
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          }
        />

        <Route path="/login" element={<CustomerAuth />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/address" element={<AddressManager />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
      </Routes>
    </div>
  );
};

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
