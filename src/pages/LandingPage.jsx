// src/pages/LandingPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { fetchProducts, fetchCategories } from '../api/api'; 
import CategoryRail from '../components/home/CategoryRail';
import HeroBanner from '../components/home/HeroBanner';
import ProductCard from '../components/product/ProductCard';
import { X } from 'lucide-react';

const LandingPage = ({ searchTerm }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Category State ---
    const [mainCategories, setMainCategories] = useState([]); // All categories, including nested sub-categories
    const [selectedMainCategory, setSelectedMainCategory] = useState(null); // The parent category (e.g., Electronics)
    const [selectedSubCategory, setSelectedSubCategory] = useState(null); // The actual filter (e.g., Laptops or Home Goods)

    // --- Data Loading: Products and Categories ---
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Categories first to set up the rails
                const categories = await fetchCategories();
                if (Array.isArray(categories)) {
                    setMainCategories(categories);
                }

                // Fetch Products
                const productData = await fetchProducts();
                if (Array.isArray(productData)) {
                    setProducts(productData);
                } else {
                    setProducts([]);
                }
            } catch (err) {
                console.error("Data load error:", err);
                setError("Unable to connect to the store or fetch data.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- Category Selection Handler ---
    const handleCategorySelect = (category) => {
        // This handler receives a category object from CategoryRail

        if (!category) {
            // This case should ideally not happen if CategoryRail is used correctly, 
            // but is a safety net for clearing all category filters.
            setSelectedMainCategory(null);
            setSelectedSubCategory(null);
            return;
        }
        
        // 1. Check if the clicked item is a main category (i.e., has sub_categories array)
        if (category.sub_categories && category.sub_categories.length > 0) {
            
            // Check for Deselection (if they click the active main category again)
            if (selectedMainCategory && selectedMainCategory.id === category.id) {
                setSelectedMainCategory(null);
                setSelectedSubCategory(null);
            } else {
                // Select new Main Category, which shows the Sub Rail
                setSelectedMainCategory(category);
                setSelectedSubCategory(null); // Clear product filter
            }
            
        } else {
            // 2. This is a leaf category (either a top-level without subs, or a sub-category)
            
            // If the user clicks the currently active sub-category, deselect it.
            if (selectedSubCategory && selectedSubCategory.id === category.id) {
                setSelectedSubCategory(null);
            } else {
                // Select this category for product filtering
                setSelectedSubCategory(category);
                
                // If this sub-category was clicked, we still want its main parent highlighted
                // NOTE: In a real app, 'category' needs a 'parent_id' field to correctly set selectedMainCategory.
                // Since we don't have that, we rely on the sub-category being clicked from the visible sub-rail.
            }
        }
    };
    
    // --- Determine Active Filter ID for Product Filtering ---
    const activeFilterId = selectedSubCategory ? selectedSubCategory.id : (selectedMainCategory && !selectedMainCategory.sub_categories?.length ? selectedMainCategory.id : null);
    
    // --- Filtered Products (Memoized) ---
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Search Term Check
            const term = searchTerm ? searchTerm.toLowerCase() : '';
            const matchesSearch = 
                (product.name && product.name.toLowerCase().includes(term)) || 
                (product.category && product.category.toLowerCase().includes(term));

            // Category Selection Check
            let matchesCategory = true;
            
            if (activeFilterId) {
                // Filter by the most specific ID available (activeFilterId)
                // We check both product.category_id and product.main_category_id for flexibility
                matchesCategory = (product.category_id === activeFilterId || product.main_category_id === activeFilterId); 
            }
            
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, activeFilterId]);

    // --- Clear All Filters ---
    const clearFilters = () => {
        setSelectedMainCategory(null);
        setSelectedSubCategory(null);
    };
    
    // --- Determine Header and Filter Info ---
    const activeFilter = selectedSubCategory || selectedMainCategory;
    const headerTitle = activeFilter 
        ? activeFilter.name 
        : (searchTerm ? `Results for "${searchTerm}"` : "Fresh Recommendations");

    // --- RENDER ---
    return ( 
        <div className="landing-container">
            
            {/* 1. Main Category Rail (Always Visible) */}
            <CategoryRail 
                categories={mainCategories} // Top-level categories
                onCategorySelect={handleCategorySelect} 
                // Highlight the selected Main Category or the Sub Category if its parent is visible
                selectedCategoryId={selectedMainCategory?.id || selectedSubCategory?.id}
                title="Shop by Category"
            />
            
            {/* 2. Sub-Category Rail (Conditional Visibility) */}
            {selectedMainCategory && selectedMainCategory.sub_categories && selectedMainCategory.sub_categories.length > 0 && (
                <div className="sub-category-rail-wrapper mt-4">
                    <div className="category-header-wrapper">
                        {/* Back button logic is handled inside the CategoryRail component, 
                            but for the dual rail, we just provide the category list. 
                            We can add a title here for clarity. 
                        */}
                        <h3 className="rail-title-sub">Sub-Categories of **{selectedMainCategory.name}**</h3>
                    </div>
                    <CategoryRail 
                        categories={selectedMainCategory.sub_categories}
                        onCategorySelect={handleCategorySelect}
                        selectedCategoryId={selectedSubCategory?.id} // Only highlight the specific sub-category
                        isSubRail={true} 
                    />
                </div>
            )}
            
            ---

            {/* Hero Banner - Only show when no search/category filters active */}
            {!searchTerm && !activeFilter && <HeroBanner />}

            ---

            {/* Product Grid Section */}
            <div className="page-content mt-6">
                
                {/* Section Header */}
                <div className="section-header">
                    <h2 className="section-title">
                        {activeFilter ? (
                            <>
                                <span>{headerTitle}</span>
                                <span className="section-title-count">({filteredProducts.length})</span>
                            </>
                        ) : (
                            headerTitle
                        )}
                    </h2>

                    {/* Clear Filter Button */}
                    {(activeFilter || searchTerm) && (
                        <button 
                            onClick={clearFilters}
                            className="clear-filter-btn"
                            aria-label="Clear filters"
                        >
                            <X size={14} /> Clear {activeFilter ? "Category" : "Search"}
                        </button>
                    )}
                </div>

                {/* Error, Loading, and Product Grid */}
                {error && (
                    <div className="error-message animate-fade-in">
                        {error} Showing cached data.
                    </div>
                )}

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {/* Product Grid */}
                        <div className="product-grid animate-fade-in">
                            {filteredProducts.map((product, index) => (
                                <div 
                                    key={product.id}
                                    className="animate-scale-in"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredProducts.length === 0 && (
                            <div className="empty-state animate-fade-in">
                                <div className="empty-state-icon">🔎</div>
                                <p className="empty-state-title">No products found.</p>
                                <p className="empty-state-description">
                                    Try selecting a different category or checking your spelling.
                                </p>
                                <button 
                                    onClick={clearFilters}
                                    className="empty-state-btn"
                                >
                                    View All Products
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LandingPage;