// src/pages/OrderHistoryPage.jsx
import React, { useState, useEffect } from 'react'; // ⭐️ Added useEffect
import { useNavigate } from 'react-router-dom';
// ⭐️ Import the Context and its Hook
import { useOrder, OrderProvider } from '../../context/OrderContext'; 
// Assuming useAddress/useProfile provides userId
import { useAddress } from '../../context/AddressContext'; 
import { Package, ShoppingBag, Loader, CornerDownLeft, X, AlertTriangle, Star } from 'lucide-react';


// -----------------------------------------------------------------------------------
// --- NEW COMPONENTS FOR REVIEW FUNCTIONALITY ---
// -----------------------------------------------------------------------------------

// ⭐️ REMOVED: Mock API function 'submitProductReview' is no longer needed.


// Helper component for Star Rating input (Unchanged)
const StarRating = ({ value, onRate, disabled }) => {
    return (
        <div className="star-rating">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <Star
                        key={index}
                        size={18}
                        className={`star ${ratingValue <= value ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
                        onClick={() => !disabled && onRate(ratingValue)}
                    />
                );
            })}
        </div>
    );
};

// Component for the Review Form
const ProductReviewForm = ({ product, orderId, userId, fetchOrders }) => {
    // ⭐️ Retrieve all necessary functions from the Order Context
    const { addProductReview, updateProductReview, fetchProductReview } = useOrder();

    // State for existing review data
    const [reviewId, setReviewId] = useState(null); // ID of existing review if found
    const [initialLoading, setInitialLoading] = useState(true); // Loading state for initial fetch
    
    // State for form fields
    const [rating, setRating] = useState(0);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Derived state to check if the user is editing an existing review
    const isEditing = reviewId !== null;

    // 1. Fetch existing review on mount
    useEffect(() => {
        const loadReview = async () => {
            setInitialLoading(true);
            try {
                // Call the context function to check for an existing review
                const existingReview = await fetchProductReview(product.product_id);

                if (existingReview) {
                    setReviewId(existingReview.id);
                    // Set form fields with existing data from the backend response
                    setRating(existingReview.rating || 0);
                    // Backend uses 'comment', so we use that to set 'description'
                    setDescription(existingReview.comment || ''); 
                }
            } catch (error) {
                // Log the error but continue, allowing the user to submit a new review.
                console.error("Failed to load existing review:", error);
            } finally {
                setInitialLoading(false);
            }
        };

        loadReview();
    // Dependency array ensures this runs once per product, and when fetchProductReview changes
    }, [product.product_id, fetchProductReview]); 
    
    // Show a loading state while checking for existing review
    if (initialLoading) {
        return (
            <div className="review-success-message" style={{ backgroundColor: '#f0f8ff', borderColor: '#007bff', color: '#007bff' }}>
                <p>Checking for existing review...</p>
            </div>
        );
    }


    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }

        setIsSubmitting(true);
        
        const data = { rating, description };
        let result;

        if (isEditing) {
            // ⭐️ UPDATE EXISTING REVIEW: Pass reviewId and the updated data
            result = await updateProductReview(reviewId, data);
        } else {
            // ⭐️ ADD NEW REVIEW: Pass productId and the new data
            result = await addProductReview({ productId: product.product_id, ...data });
        }

        if (result.success) {
            alert(result.message);
            
            // If successfully added a NEW review, set the ID to switch to edit mode
            if (result.review && !isEditing) {
                 setReviewId(result.review.id);
            }
            // Optionally refresh the order list
            if (fetchOrders) fetchOrders(); 
        } else {
            // Display error message from the context/API
            alert(`Action Failed: ${result.message}`);
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleReviewSubmit} className="review-form-container">
            <h5 className="review-product-name">
                {isEditing ? 'Update Review:' : 'Write Review:'} {product.name} ({product.value})
            </h5>
            
            <div className="review-row">
                <label>Your Rating:</label>
                {/* Value is now initialized from state, which is populated by fetchProductReview */}
                <StarRating value={rating} onRate={setRating} disabled={isSubmitting} />
            </div>
            
            <div className="review-row">
                <label htmlFor={`review-desc-${product.id}`}>Description:</label>
                <textarea
                    id={`review-desc-${product.id}`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us what you think..."
                    rows="2"
                    disabled={isSubmitting}
                />
            </div>
            
            <div className="review-submit-row">
                <button 
                    type="submit" 
                    className="btn-yellow-primary submit-review-btn"
                    disabled={isSubmitting || rating === 0}
                >
                    {isSubmitting 
                        ? (isEditing ? 'Updating...' : 'Submitting...') 
                        : (isEditing ? 'Update Review' : 'Submit Review') // ⭐️ Dynamic Button Text
                    }
                </button>
            </div>
            <hr className="review-separator"/>
        </form>
    );
};


// -----------------------------------------------------------------------------------
// --- ORDER ITEM CARD (UNMODIFIED) ---
// -----------------------------------------------------------------------------------

const OrderItemCard = ({ item, userId, fetchOrders }) => {
    // ⭐️ Get cancellation function from context
    const { cancelUserOrder } = useOrder(); 
    const [isCancelling, setIsCancelling] = useState(false); 
    const totalItems = item.items.reduce((sum, product) => sum + product.quantity, 0);
    const totalAmount = parseFloat(item.total).toFixed(0);
    const statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1);
    
    // ⭐️ CANCELLATION LOGIC: Only allow cancellation for these statuses.
    const isCancellable = ['pending', 'accepted', 'forwarded'].includes(item.status);
    
    // ⭐️ REVIEW LOGIC: Only allow review for this status.
    const isReviewable = item.status === 'delivered';

    const getStatusClass = (status) => {
        switch (status) {
            case 'accepted': return 'status-accepted';
            case 'forwarded': return 'status-forwarded';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled'; 
            default: return 'status-pending';
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    // ⭐️ Handler for cancellation
    const handleCancel = async () => {
        if (!window.confirm(`Are you sure you want to cancel Order #${item.id}? This action cannot be undone.`)) {
            return;
        }

        setIsCancelling(true);
        try {
            // Pass the order ID to the context function, which calls the API
            const result = await cancelUserOrder(item.id);

            if (result.success) {
                alert(result.message); 
            } else {
                alert(`Cancellation Failed: ${result.message}`); 
            }
        } catch (err) {
            alert("An unknown error occurred during cancellation.");
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className="order-card">
            <div className="order-header">
                <div className="order-header-left">
                    <p className="order-id">Order ID: **#{item.id}**</p>
                    <p className="order-date">Placed on: {formatDate(item.date)}</p>
                </div>
                <div className={`order-status-badge ${getStatusClass(item.status)}`}>
                    {statusText}
                </div>
            </div>

            <div className="order-details-summary">
                <div className="order-detail-row">
                    <span>Total Items</span>
                    <strong>{totalItems}</strong>
                </div>
                <div className="order-detail-row total-amount-row">
                    <span>Order Total</span>
                    <strong>₹{totalAmount}</strong>
                </div>
            </div>

            <div className="order-items-preview">
                {/* ⭐️ Iterating over items, showing preview AND conditional review form */}
                {isReviewable && <p className="review-prompt-message">🎉 This order has been delivered! Write or update your review for your items below.</p>}
                
                {item.items.map((product) => (
                    <div key={product.id} className={`item-review-wrapper ${isReviewable ? 'reviewable' : ''}`}>
                        <div className="item-row">
                            <Package size={14} className="item-icon" />
                            <span className="item-name">{product.name} ({product.value})</span>
                            <span className="item-quantity">x{product.quantity}</span>
                        </div>
                        {/* ⭐️ Conditional Review Form */}
                        {isReviewable && (
                            <ProductReviewForm 
                                product={product} 
                                orderId={item.id} 
                                userId={userId} 
                                fetchOrders={fetchOrders}
                            />
                        )}
                    </div>
                ))}
                
            </div>

            <div className="order-actions">
                <button 
                    className="btn-yellow-outline" 
                    onClick={() => console.log('View details for', item.id)}
                >
                    View Details
                </button>
                
                {/* ⭐️ Conditional Cancel Button (Only if status is cancellable) */}
                {isCancellable && (
                    <button 
                        className="btn-red-outline" 
                        onClick={handleCancel}
                        disabled={isCancelling}
                    >
                        {isCancelling ? (
                            <>
                                Cancelling... 
                                <Loader size={16} className="spin" />
                            </>
                        ) : (
                            'Cancel'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};


// -----------------------------------------------------------------------------------
// --- MAIN ORDER HISTORY PAGE COMPONENT (UNMODIFIED) ---
// -----------------------------------------------------------------------------------

const OrderHistoryPage = ({ userId }) => {
    const { orders, loading, error, fetchOrders } = useOrder(); 
    const navigate = useNavigate();

    const customStyles = `
        /* General Layout */
        .order-history-page {
            padding: 40px 20px;
            background-color: #f7f7f7;
            min-height: 80vh;
        }
        .order-history-container {
            max-width: 900px;
            margin: 0 auto;
            background: white; 
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
            padding-bottom: 15px;
        }
        .page-header h1 {
            font-size: 32px;
            font-weight: 700;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .order-list {
            display: grid;
            gap: 20px;
        }

        /* Order Card */
        .order-card {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            transition: box-shadow 0.2s;
        }
        .order-card:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }

        /* Order Header & Details */
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #f0f0f0;
        }
        .order-id { font-weight: 600; color: #333; margin-bottom: 4px; }
        .order-date { font-size: 14px; color: #666; }
        .order-details-summary { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #f0f0f0; }
        .order-detail-row { display: flex; justify-content: space-between; font-size: 16px; padding: 4px 0; }
        .total-amount-row { font-size: 18px; font-weight: 700; margin-top: 5px; border-top: 1px solid #eee; padding-top: 10px !important; }
        .order-items-preview { margin-bottom: 15px; }
        .review-prompt-message { font-size: 14px; color: #28a745; font-weight: 600; margin-bottom: 10px; border-left: 3px solid #28a745; padding-left: 10px;}
        
        .item-review-wrapper { border: 1px solid #f0f0f0; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; }
        .item-review-wrapper.reviewable { border-color: #ffeeba; background-color: #fffdf7; } /* Highlight for reviewable items */

        .item-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #555; padding: 3px 0; }
        .item-name { flex-grow: 1; }
        .more-items-notice { font-size: 13px; color: #007bff; text-align: right; margin-top: 5px; font-style: italic; }

        /* Status Badge Styling */
        .order-status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            color: white;
            min-width: 100px;
            text-align: center;
        }
        .status-accepted { background-color: #28a745; } 
        .status-forwarded { background-color: #007bff; }
        .status-delivered { background-color: #6c757d; }
        .status-pending { background-color: #ffc107; } 
        .status-cancelled { background-color: #dc3545; } 

        /* Buttons (Yellow theme as requested) */
        .order-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .btn-yellow-outline {
            padding: 8px 15px;
            background: none;
            border: 1px solid #ffc107;
            border-radius: 4px;
            color: #ffc107;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .btn-yellow-outline:hover {
            background-color: #ffc107;
            color: #333;
        }
        /* New class for review submit button */
        .btn-yellow-primary {
            padding: 6px 12px;
            background-color: #ffc107;
            border: 1px solid #ffc107;
            border-radius: 4px;
            color: #333;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .btn-yellow-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-red-outline {
            padding: 8px 15px;
            background: none;
            border: 1px solid #dc3545;
            border-radius: 4px;
            color: #dc3545;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex; 
            align-items: center;
            gap: 5px;
        }
        .btn-red-outline:hover:not(:disabled) { 
            background-color: #dc3545;
            color: white;
        }
        .btn-red-outline:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        /* State messages and Spin animation */
        .state-message {
            text-align: center;
            padding: 50px 20px;
            border: 1px dashed #ccc;
            border-radius: 8px;
            margin-top: 20px;
        }
        .state-message .icon {
            color: #ffc107;
            margin-bottom: 15px;
        }
        .state-message .icon.spin {
            animation: spin 1s linear infinite; 
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* ⭐️ NEW REVIEW STYLES ⭐️ */
        .review-form-container {
            padding: 10px 0 0;
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .review-form-container .review-product-name {
            font-size: 14px;
            font-weight: 600;
            color: #555;
            margin: 0;
        }
        .review-form-container .review-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            color: #666;
        }
        .review-form-container .review-row label {
            min-width: 90px;
        }
        .review-form-container textarea {
            flex-grow: 1;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            resize: vertical;
        }
        .review-form-container .review-submit-row {
            display: flex;
            justify-content: flex-end;
            margin-top: 5px;
        }
        .review-separator {
            border: none;
            border-top: 1px dashed #eee;
            margin: 10px 0 0;
        }
        .review-success-message {
            margin-top: 10px;
            padding: 8px;
            background-color: #e6ffed;
            border: 1px solid #28a745;
            border-radius: 4px;
            text-align: center;
            font-size: 14px;
            color: #28a745;
        }

        /* Star Rating Styles */
        .star-rating {
            cursor: pointer;
            display: flex;
            align-items: center;
        }
        .star {
            color: #ccc; /* Unfilled star color */
            transition: color 0.1s;
        }
        .star.filled {
            color: #ffc107; /* Filled star color */
        }
        .star.disabled {
            cursor: not-allowed;
        }
    `;

    if (loading) {
        return (
            <div className="order-history-page">
                <style>{customStyles}</style>
                <div className="order-history-container">
                    <div className="state-message">
                        <Loader size={48} className="icon spin" />
                        <h2>Loading Orders...</h2>
                        <p>Please wait while we fetch your history.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-history-page">
                <style>{customStyles}</style>
                <div className="order-history-container">
                    <div className="state-message">
                        <AlertTriangle size={48} className="icon" style={{ color: '#dc3545' }} />
                        <h2>An Error Occurred</h2>
                        <p>{error}</p>
                        <button className="btn-yellow-outline" onClick={fetchOrders}>Try Again</button>
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="order-history-page">
                <style>{customStyles}</style>
                <div className="order-history-container">
                    <div className="state-message">
                        <ShoppingBag size={48} className="icon" />
                        <h2>No Orders Yet</h2>
                        <p>Looks like you haven't placed any orders.</p>
                        <button 
                            className="btn-yellow-outline" 
                            onClick={() => navigate('/')}
                            style={{ padding: '10px 20px' }}
                        >
                            <CornerDownLeft size={18} /> Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="order-history-page">
            <style>{customStyles}</style>
            <div className="order-history-container">
                <div className="page-header">
                    <h1>
                        <Package size={32} />
                        Your Order History
                    </h1>
                    <button 
                        className="btn-yellow-outline" 
                        onClick={() => navigate('/')}
                        style={{ padding: '10px 20px' }}
                    >
                        <CornerDownLeft size={18} /> Continue Shopping
                    </button>
                </div>
                
                <div className="order-list">
                    {orders.map((order) => (
                        // OrderItemCard now receives userId and fetchOrders
                        <OrderItemCard 
                            key={order.id} 
                            item={order} 
                            userId={userId} 
                            fetchOrders={fetchOrders}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------------------------
// --- EXPORT WRAPPER (UNMODIFIED) ---
// -----------------------------------------------------------------------------------

/**
 * This component is used to wrap OrderHistoryPage with the necessary context.
 * It uses a mock implementation for useAddress/userId for demonstration.
 */
const OrderHistoryWrapper = () => {
    // ⭐️ MOCKING useAddress for userId based on previous context.
    const mockUseAddress = () => ({ userId: localStorage.getItem("userId") || 4 }); 
    const userId = (useAddress || mockUseAddress)().userId; 
    
    return (
        <OrderProvider userId={userId}>
            <OrderHistoryPage userId={userId} />
        </OrderProvider>
    );
};

export default OrderHistoryWrapper;