import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// Ensure fetchSubCategories is correctly imported and accepts an ID
import { fetchCategories, fetchSubCategories } from '../../api/api'; 
import { getImageUrl } from '../../api/config';
import './CategoryRail.css';

const CategoryRail = ({ onCategorySelect, selectedCategoryId }) => {
    // State to hold ALL top-level categories
    const [allCategories, setAllCategories] = useState([]);
    // State for the categories currently displayed (Top-Level or Sub-Categories)
    const [displayedCategories, setDisplayedCategories] = useState([]);
    // State for the parent category (used for Back button and title)
    const [currentParent, setCurrentParent] = useState(null); 
    
    const [loading, setLoading] = useState(true);
    const [subCatLoading, setSubCatLoading] = useState(false);
    const navigate = useNavigate();

    // --- Data Loading: Initial Load (Top-level categories) ---
    useEffect(() => {
        const loadCategories = async () => {
            setLoading(true);
            try {
                const data = await fetchCategories();
                if (Array.isArray(data)) {
                    setAllCategories(data);
                    setDisplayedCategories(data); 
                }
            } catch (error) {
                console.error("Category load failed:", error);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    // --- Fetch and Display Subcategories ---
    const fetchAndDisplaySubCategories = useCallback(async (parentCategory) => {
        setSubCatLoading(true);
        try {
            // ⭐️ API CALL: Fetch subcategories for the parent ID
            const subData = await fetchSubCategories(parentCategory.id); 

            if (Array.isArray(subData) && subData.length > 0) {
                setCurrentParent(parentCategory);
                setDisplayedCategories(subData);
                // Clear any previous selection made on the parent level
                onCategorySelect(null); 
            } else {
                // If no subcategories are found, treat the click as a final selection
                onCategorySelect(parentCategory.id);
            }
        } catch (error) {
            console.error("Subcategory load failed:", error);
            // Optionally, select the parent category if sub-fetch fails
            onCategorySelect(parentCategory.id); 
        } finally {
            setSubCatLoading(false);
        }
    }, [onCategorySelect]);

    // --- Click Handler Logic ---
    const handleCategoryClick = (category) => {
        // 1. Check for Deselection (Only if the category is the current focus of the rail)
        if (selectedCategoryId === category.id) {
            onCategorySelect(null);
            return;
        }

        // Check if the category has sub-categories (assuming your API provides a way to know, 
        // e.g., a flag like 'has_children' or a non-empty 'sub_categories' array)
        const hasSubCategories = category.has_children || (category.sub_categories && category.sub_categories.length > 0);

        if (hasSubCategories && !currentParent) {
            // 2. Select a MAIN category with children: Fetch and display subcategories
            fetchAndDisplaySubCategories(category); 
            
        } else if (currentParent && hasSubCategories) {
             // 2b. Select a SUB-category that might have children (multi-level hierarchy)
             fetchAndDisplaySubCategories(category);

        } else {
            // 3. Select Leaf Category (No more children): Final selection for product filtering
            onCategorySelect(category.id); 
        }
    };
    
    // --- Back Button Handler ---
    const handleGoBack = () => {
        // Clear the current parent and show the top level again
        setCurrentParent(null);
        setDisplayedCategories(allCategories);
        onCategorySelect(null); // Clear external selection when going back to top level
    };
    
    // --- Determine Title ---
    const railTitle = currentParent 
        ? `Subcategories of ${currentParent.name}` 
        : "Shop by Category";

    return (
        <div className="category-rail-container">
            <div className="category-rail-content">
                <div className="category-header-wrapper">
                    {/* Render Back Button only if not on the top level */}
                    {currentParent && (
                        <motion.button 
                            className="back-button"
                            onClick={handleGoBack}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            ← Back to All
                        </motion.button>
                    )}
                    <h3 className="category-rail-title">{railTitle}</h3>
                </div>
                
                <div className="category-scroll-container no-scrollbar">
                    
                    {/* Loading State: Initial load or fetching sub-categories */}
                    {(loading || subCatLoading) && [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="category-skeleton" aria-hidden="true">
                            <div className="category-skeleton-image"></div>
                            <div className="category-skeleton-text"></div>
                        </div>
                    ))}

                    {/* Category Cards (using displayedCategories) */}
                    {!(loading || subCatLoading) && displayedCategories.map((cat, index) => (
                        <motion.div 
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`category-card ${selectedCategoryId === cat.id ? 'category-card-selected' : ''}`}
                            onClick={() => handleCategoryClick(cat)}
                            role="button"
                        >
                            <div className="category-image-container">
                                <img 
                                    src={getImageUrl(cat.image)} 
                                    alt={cat.name} 
                                    className="category-image"
                                    loading="lazy"
                                    onError={(e) => { 
                                        e.target.src = 'https://via.placeholder.com/64?text=' + cat.name.charAt(0); 
                                    }}
                                />
                                {/* Optional: Show an arrow if it has sub-categories (based on assumed API flag) */}
                                {cat.has_children && ( 
                                     <span className="category-arrow">→</span>
                                )}
                            </div>
                            <span className="category-name">
                                {cat.name}
                            </span>
                        </motion.div>
                    ))}
                    
                    {/* Empty State for fetched sub-categories */}
                    {!(loading || subCatLoading) && displayedCategories.length === 0 && currentParent && (
                        <div className="empty-state-category-rail">
                            No subcategories found for **{currentParent.name}**.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryRail;