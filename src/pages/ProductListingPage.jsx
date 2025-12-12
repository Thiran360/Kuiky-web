// src/pages/ProductListingPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { productService } from '../api/productService'; // Import the new service
import ProductCard from '../components/common/ProductCard'; // Assuming path
import { Grid, AlertCircle, Loader } from 'lucide-react';

// Basic CSS structure for the page (create this file too)
import './ProductListingPage.css'; 

const ProductListingPage = () => {
    // Get categoryId from the URL (e.g., /products/category/:categoryId)
    const { categoryId } = useParams(); 
    // Get state passed from CategoryRail (e.g., categoryName)
    const location = useLocation();
    const categoryName = location.state?.categoryName || 'Products';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        setProducts([]);

        if (!categoryId) {
            // Handle case where URL is /products/category/ (no ID)
            setError("No category selected.");
            setLoading(false);
            return;
        }

        try {
            // ⭐️ Use the categoryId to filter products
            const fetchedProducts = await productService.fetchProducts({ 
                categoryId: categoryId 
            });
            setProducts(fetchedProducts);
        } catch (err) {
            console.error("Failed to fetch products for category:", err);
            setError(`Could not load products for ${categoryName}.`);
        } finally {
            setLoading(false);
        }
    }, [categoryId, categoryName]);

    // Reload products whenever the categoryId in the URL changes
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="loading-state">
                    <Loader className="spinner" size={48} />
                    <p>Loading products in {categoryName}...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="error-state">
                    <AlertCircle size={24} />
                    <p>{error}</p>
                </div>
            );
        }

        if (products.length === 0) {
            return (
                <div className="empty-state">
                    <Grid size={32} />
                    <h2>No Products Found</h2>
                    <p>It looks like there are no products in the **{categoryName}** category yet.</p>
                </div>
            );
        }

        return (
            <div className="product-grid">
                {products.map(product => (
                    // ProductCard is used to display each product
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        );
    };

    return (
        <div className="product-listing-page-wrapper">
            <div className="product-listing-header">
                <h1 className="page-title">{categoryName}</h1>
                <p className="product-count">{products.length} items</p>
            </div>
            {renderContent()}
        </div>
    );
};

export default ProductListingPage;