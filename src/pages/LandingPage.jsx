import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Sparkles, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import CategoryRail from '../components/home/CategoryRail';
import HeroBanner from '../components/home/HeroBanner';
import ProductCard from '../components/product/ProductCard';
import { fetchProducts } from '../api/api';
import './LandingPage.css';

const LandingPage = ({ searchTerm }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [isTertiarySelection, setIsTertiarySelection] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const productData = await fetchProducts({ 
          categoryId: selectedCategory, 
          subcategoryId: selectedSubId, 
          search: searchTerm 
        });
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (err) {
        console.error("Products load error:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedCategory, selectedSubId, searchTerm]);

  // Sync with CategoryRail for absolute discovery
  const handleNavSelect = (catId, catName, subName, subId = null, isTertiary = false) => {
    setSelectedCategory(catId);
    setSelectedCategoryName(catName);
    setSelectedSubCategory(subName);
    setSelectedSubId(subId);
    setIsTertiarySelection(isTertiary);
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    // 1. Filter by Search Term (Global search)
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    // 2. Filter by Category ID (Primary Sector)
    if (selectedCategory) {
      result = result.filter(p => {
        const pCatId = p.category?.id || p.category_id || p.category;
        return String(pCatId) === String(selectedCategory);
      });
    }

    // 3. Filter by SubCategory (Granular Sector)
    if (selectedSubId) {
      result = result.filter(p => {
        const pSubId = p.subcategory_id || p.subcategory?.id || p.subcategory;
        return String(pSubId) === String(selectedSubId);
      });
    } else if (selectedSubCategory) {
      result = result.filter(p => {
        const subName = typeof p.subcategory === 'string' ? p.subcategory : (p.subcategory?.name || p.subcategory_name);
        return subName?.toLowerCase() === selectedSubCategory.toLowerCase();
      });
    }

    return result;
  }, [products, selectedCategory, selectedSubCategory, selectedSubId, searchTerm]);

  return (
    <div className="landing-container">
      <CategoryRail onNavSelect={handleNavSelect} />

      {/* 🚀 ELITE DISCOVERY GUARD: Only show HeroBanner when no active filters (Category/Sub/Search) are present */}
      {(!selectedCategory && !selectedSubCategory && !searchTerm) && <HeroBanner />}

      <main className="page-content">
        <section className="products-section" id="products-section">
          <div className="prem-section-header">
            <div className="prem-section-title-group">
              <div className="prem-section-icon-wrap">
                <LayoutGrid size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="prem-section-title">
                  {selectedSubCategory || selectedCategoryName || "Our Collection"}
                </h2>
                <p className="prem-section-subtitle">
                  {selectedSubCategory || selectedCategoryName
                    ? `Showing ${selectedSubCategory || selectedCategoryName} items`
                    : "Handpicked items curated for you"}
                </p>
              </div>
            </div>

            {!loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="prem-count-badge"
              >
                <Package size={14} />
                <span>{filteredProducts.length} Items Available</span>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="prem-loading-state"
              >
                <div className="prem-loader">
                  <div className="prem-loader-ring"></div>
                  <Sparkles size={20} className="prem-loader-icon" />
                </div>
                <p className="prem-loading-text">Discovering premium products...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prem-error-state"
              >
                <p>{error}</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prem-product-grid"
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id || index} product={product} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prem-empty-state"
            >
              <div className="prem-empty-icon">
                <LayoutGrid size={48} strokeWidth={1.5} className="text-yellow-500 opacity-20" />
              </div>
              <h3 className="prem-empty-title">
                {(selectedSubCategory && !isTertiarySelection) ? "Discovery Refinement Required" : "No results in this sector"}
              </h3>
              <p className="prem-empty-desc">
                {(selectedSubCategory && !isTertiarySelection)
                  ? `Please select a specific sub-section within ${selectedSubCategory} from the options above to discover our collection.`
                  : "Try adjusting your filters or explore our other premium categories to find what you're looking for."}
              </p>
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
};

export default LandingPage;