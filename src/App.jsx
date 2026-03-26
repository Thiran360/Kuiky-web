// src/App.js
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

// --- Context Providers ---
import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";
import { AddressProvider } from "./context/AddressContext";
import { WishlistProvider } from "./context/WishlistContext";
import { OrderProvider } from "./context/OrderContext";

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
import CelestialBackground from "./components/common/CelestialBackground";

// ------------------------------
// APP CONTENT (inside Router)
// ------------------------------

import { setAuthToken } from "./api/api";

const token = localStorage.getItem("accessToken");

if (token) {
  setAuthToken(token);
}
const AppContent = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-transparent font-sans text-gray-900 antialiased flex flex-col">
      <CelestialBackground />
      {/* HEADER */}
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* MAIN CONTENT */}
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                searchTerm={searchTerm}
              />
            }
          />
          <Route path="/login" element={<CustomerAuth />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/address" element={<AddressManager />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
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
