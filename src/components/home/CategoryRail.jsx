import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// Ensure both fetchCategories and fetchSubCategories are imported
import { fetchCategories, fetchSubCategories } from '../../api/api'; 
import { getImageUrl } from '../../api/config';
import './CategoryRail.css';

// Tracks the path (e.g., [MainCategory, SubCategory, SubSubCategory])
const CategoryRail = ({ onCategorySelect, selectedCategoryId }) => {
    // State to hold ALL top-level categories
    const [allCategories, setAllCategories] = useState([]);
    // State for the categories currently displayed (Top-Level or Sub-Categories)
    const [displayedCategories, setDisplayedCategories] = useState([]);
    
    // State to track the current position in the hierarchy
    // Structure: [{ category: {id: 1, name: 'Electronics'}, data: [...] }]
    const [categoryHistory, setCategoryHistory] = useState([]); 
    const [currentparent,setCurrentParent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subCatLoading, setSubCatLoading] = useState(false);
    const navigate = useNavigate();

    // The current parent is the last item in the history, or null if at top level
    const currentParent = categoryHistory.length > 0 
        ? categoryHistory[categoryHistory.length - 1].category
        : null;

    // --- Data Loading: Initial Load (Top-level categories) ---
    useEffect(() => {
        const loadCategories = async () => {
            setLoading(true);
            try {
                // Fetch ALL main categories
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
    const fetchAndDisplaySubCategories = useCallback(async (categoryToDrillDown, isMainCategory = false) => {
        setSubCatLoading(true);
        try {
            let subData;

            if (isMainCategory) {
                // Scenario 1: Drill down from a Main Category to its top-level subcategories
                // API Call: ?category_id=<ID>&parent_subcategory_id=null
                subData = await fetchSubCategories(categoryToDrillDown.id, 'null'); 
            } else {
                // Scenario 2: Drill down from a Subcategory to its children
                // API Call: ?parent_subcategory_id=<ID>
                subData = await fetchSubCategories(undefined, categoryToDrillDown.id); 
            }

            if (Array.isArray(subData) && subData.length > 0) {
                // Add the current parent to history and display the children
                setCategoryHistory(prev => [
                    ...prev, 
                    { category: categoryToDrillDown, data: displayedCategories }
                ]);
                setDisplayedCategories(subData);
                // Clear any external selection when moving deeper
                onCategorySelect(null); 
            } else {
                // If no subcategories are found, treat the click as a final selection
                onCategorySelect(categoryToDrillDown.id);
            }
        } catch (error) {
            console.error("Subcategory load failed:", error);
            // If fetch fails, still treat the parent as the selected category
            onCategorySelect(categoryToDrillDown.id); 
        } finally {
            setSubCatLoading(false);
        }
    }, [onCategorySelect, displayedCategories]);

    // --- Click Handler Logic ---
    const handleCategoryClick = (category) => {
        // 1. Deselection
        if (selectedCategoryId === category.id) {
            onCategorySelect(null);
            return;
        }
        
        // Find out if the clicked category is a main category
        const isMainCategory = allCategories.some(cat => cat.id === category.id);

        // Check if the category has children (assuming your API provides a way to know, 
        // or we treat it as having children if we can fetch subcategories for it).
        // For simplicity and relying on the API structure, we assume any click *could* lead to subcategories.
        // If the click is on the top-level rail, it must be a main category.
        
        if (isMainCategory && categoryHistory.length === 0) {
            // 2. Click on a TOP-LEVEL MAIN CATEGORY (e.g., "Electronics")
            // This needs to fetch subcategories with parent_subcategory_id=null
            fetchAndDisplaySubCategories(category, true);
        } else if (!isMainCategory || categoryHistory.length > 0) {
             // 3. Click on a SUB-CATEGORY (multi-level hierarchy)
             // This needs to fetch subcategories using parent_subcategory_id=<ID>
             fetchAndDisplaySubCategories(category, false);
        } else {
            // 4. Fallback: Leaf category selection
            onCategorySelect(category.id);
        }
    };
    
    // --- Back Button Handler ---
    const handleGoBack = () => {
        if (categoryHistory.length > 0) {
            // Pop the last entry from history
            const previousStep = categoryHistory[categoryHistory.length - 1];
            
            // Restore the previous list and history
            setDisplayedCategories(previousStep.data);
            setCategoryHistory(prev => prev.slice(0, -1));
            onCategorySelect(null); // Clear external selection
        } else {
            // Should only happen if handleGoBack is called when history is empty (i.e., at the very top level)
            setCurrentParent(null); // This is handled implicitly now by categoryHistory.length
            setDisplayedCategories(allCategories);
            onCategorySelect(null);
        }
    };
    
    // --- Determine Title ---
    const railTitle = currentParent 
        ? currentParent.name // Use the name of the current parent (last item in history)
        : "Shop by Category";

    return (
        <div className="category-rail-container">
            <div className="category-rail-content">
                <div className="category-header-wrapper">
                    {/* Render Back Button only if history is not empty (i.e., not at the top level) */}
                    {categoryHistory.length > 0 && (
                        <motion.button 
                            className="back-button"
                            onClick={handleGoBack}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            ← Back to {categoryHistory.length === 1 ? 'All Categories' : categoryHistory[categoryHistory.length - 2]?.category.name || 'Previous Level'}
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
                                {/* Assuming 'has_children' is present on the category object when it has subcategories */}
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