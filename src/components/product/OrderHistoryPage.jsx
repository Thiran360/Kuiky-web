import React, { useState, useEffect } from 'react';
import { useOrder, OrderProvider } from '../../context/OrderContext';
import { useAddress } from '../../context/AddressContext';
import { ShoppingBag, Loader, AlertTriangle, Star, X } from 'lucide-react';
import { getImageUrl } from '../../api/config';

const StarRating = ({ value, onRate, disabled }) => {
    return (
        <div className="star-rating">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <Star
                        key={index}
                        size={16}
                        className={`star ${ratingValue <= value ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
                        onClick={() => !disabled && onRate(ratingValue)}
                    />
                );
            })}
        </div>
    );
};

const ProductReviewModal = ({ product, orderId, userId, onClose, fetchOrders }) => {
    const { addProductReview, updateProductReview, fetchProductReview } = useOrder();

    const [reviewId, setReviewId] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = reviewId !== null;

    useEffect(() => {
        const loadReview = async () => {
            setInitialLoading(true);
            try {
                const existingReview = await fetchProductReview(product.product_id);

                if (existingReview) {
                    setReviewId(existingReview.id);
                    setRating(existingReview.rating || 0);
                    setDescription(existingReview.comment || '');
                }
            } catch (error) {
                console.error("Failed to load existing review:", error);
            } finally {
                setInitialLoading(false);
            }
        };

        loadReview();
    }, [product.product_id, fetchProductReview]);

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
            result = await updateProductReview(reviewId, data);
        } else {
            // Include product_id in the data when adding a new review
            result = await addProductReview({ 
                productId: product.product_id, 
                product_id: product.product_id, // Make sure this is included
                ...data 
            });
        }

        if (result.success) {
            alert(result.message);
            if (result.review && !isEditing) {
                setReviewId(result.review.id);
            }
            if (fetchOrders) fetchOrders();
            onClose();
        } else {
            alert(`Action Failed: ${result.message}`);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                {initialLoading ? (
                    <div className="modal-loading">
                        <Loader size={24} className="spin" />
                        <p>Loading review...</p>
                    </div>
                ) : (
                    <form onSubmit={handleReviewSubmit}>
                        <h3 className="modal-title">{isEditing ? 'Update Your Review' : 'Rate & Review Product'}</h3>

                        <div className="modal-product-info">
                            <p className="modal-product-name">{product.name}</p>
                            <p className="modal-product-details">
                                {product.color && `Color: ${product.color}`}
                                {product.color && product.size && ' • '}
                                {product.size && `Size: ${product.size}`}
                            </p>
                        </div>

                        <div className="modal-field">
                            <label>Your Rating</label>
                            <StarRating value={rating} onRate={setRating} disabled={isSubmitting} />
                        </div>

                        <div className="modal-field">
                            <label htmlFor="review-description">Your Review</label>
                            <textarea
                                id="review-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Share your experience with this product..."
                                rows="4"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting || rating === 0}
                            >
                                {isSubmitting
                                    ? (isEditing ? 'Updating...' : 'Submitting...')
                                    : (isEditing ? 'Update Review' : 'Submit Review')
                                }
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const OrderItemCard = ({ product, userId, fetchOrders }) => {
    const [showReviewModal, setShowReviewModal] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'delivered': 'Delivered',

            'shipped': 'Shipped',
            'processing': 'Processing',
            'pending': 'Pending',
            'cancelled': 'Cancelled'
        };
        return statusMap[status?.toLowerCase()] || status || 'Processing';
    };

    const getStatusMessage = (status) => {
        const messageMap = {
            'delivered': 'Your item has been delivered',
            'shipped': 'Your item is on the way',
            'processing': 'Your order is being processed',
            'pending': 'Your order is pending',
            'cancelled': 'Your order has been cancelled'
        };
        return messageMap[status?.toLowerCase()] || 'Your order is being processed';
    };

    return (
        <div className="order-item-wrapper">
            <div className="order-item-card">
                <div className="product-image-name-container">
                    {product.image && (
                        <div className="order-item-image">
                            <img
                                src={getImageUrl(product.image || product.image_url)}
                                alt={product.name || 'Product'}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                }}
                            />
                        </div>
                    )}

                    <div className="order-item-details">
                        <h3 className="order-item-name">{product.name || product.product_name || 'Product'}</h3>
                        {(product.color || product.size) && (
                            <p className="order-item-meta">
                                {product.color && `Color: ${product.color}`}
                                {product.color && product.size && ' • '}
                                {product.size && `Size: ${product.size}`}
                            </p>
                        )}
                    </div>
                </div>

                {product.price && (
                    <div className="order-item-price">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                    </div>
                )}

                <div className="order-item-status">
                    <div className="status-indicator">
                        <span className="status-dot" data-status={product.status?.toLowerCase()}></span>
                        <span className="status-text">
                            {getStatusText(product.status)}
                            {product.deliveredDate && product.status?.toLowerCase() === 'delivered' && ` on ${formatDate(product.deliveredDate)}`}
                        </span>
                    </div>
                    <p className="status-message">{getStatusMessage(product.status)}</p>
                    {product.status?.toLowerCase() === 'delivered' && (
                        <button
                            className="rate-review-btn"
                            onClick={() => setShowReviewModal(true)}
                        >
                            <Star size={14} />
                            Rate & Review Product
                        </button>
                    )}
                </div>
            </div>

            {showReviewModal && (
                <ProductReviewModal
                    product={product}
                    orderId={product.orderId}
                    userId={userId}
                    onClose={() => setShowReviewModal(false)}
                    fetchOrders={fetchOrders}
                />
            )}
        </div>
    );
};

const OrderHistoryPage = ({ userId }) => {
    const { orders, loading, error, fetchOrders } = useOrder();

    const flattenedOrders = orders.flatMap((order) => {
        const orderItems = order.items || order.products || order.order_items || [];
        return orderItems.map((item) => ({
            ...item,
            orderId: order.id || order.order_id,
            deliveredDate: order.delivered_date || order.deliveredDate || order.date || order.created_at,
            status: order.status || item.status || 'processing',
            name: item.name || item.product_name || item.title,
            price: item.price || item.product_price || item.total,
            image: item.image || item.product_image || item.image_url,
            product_id: item.product_id || item.id
        }));
    });

    const customStyles = `
        * {
            box-sizing: border-box;
        }

        .order-history-page {
            padding: 0;
            background-color: #f8f9fa;
            min-height: 100vh;
        }

        .order-history-container {
            max-width: 1200px;
            margin: 0 auto;
            background: #ffffff;
            padding: 0;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-top: 20px;
            margin-bottom: 40px;
        }

        .order-item-card {
            display: flex;
            align-items: center;
            padding: 24px;
            background: #ffffff;
            border-bottom: 1px solid #f0f0f0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: fadeIn 0.5s ease-out;
            margin-bottom: 0;
        }

        .order-item-card:last-child {
            border-bottom: none;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .order-item-card:hover {
            background: #f9f9f9;
            transform: translateX(8px);
            box-shadow: -8px 0 0 #ffd700;
        }

        .product-image-name-container {
            display: flex;
            align-items: center;
            flex: 1;
            gap: 20px;
            margin-right: 40px;
        }

        .order-item-image {
            width: 100px;
            height: 100px;
            flex-shrink: 0;
            overflow: hidden;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            transition: all 0.3s ease;
            position: relative;
            background: #f8f9fa;
        }

        .order-item-card:hover .order-item-image {
            border-color: #ffd700;
            transform: scale(1.05) rotate(1deg);
        }

        .order-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .order-item-card:hover .order-item-image img {
            transform: scale(1.1);
        }

        .order-item-details {
            flex: 1;
            min-width: 0;
        }

        .order-item-name {
            font-size: 16px;
            font-weight: 600;
            color: #333333;
            margin: 0 0 8px 0;
            line-height: 1.4;
            transition: color 0.3s ease;
        }

        .order-item-card:hover .order-item-name {
            color: #000000;
        }

        .order-item-meta {
            font-size: 14px;
            color: #666666;
            margin: 0;
        }

        .order-item-price {
            flex-shrink: 0;
            font-size: 18px;
            font-weight: 700;
            color: #000000;
            margin-right: 60px;
            min-width: 100px;
            text-align: center;
            padding: 8px 16px;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 8px;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .order-item-card:hover .order-item-price {
            background: rgba(255, 215, 0, 0.2);
            transform: scale(1.05);
            border-color: #ffd700;
        }

        .order-item-status {
            flex-shrink: 0;
            text-align: left;
            min-width: 220px;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 6px;
        }

        .status-dot {
            width: 10px;
            height: 10px;
            background-color: #cccccc;
            border-radius: 50%;
            flex-shrink: 0;
            position: relative;
            transition: all 0.3s ease;
        }

        .status-dot[data-status="delivered"] {
            background-color: #ffd700;
            box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% {
                box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
            }
            50% {
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
            }
        }

        .status-dot[data-status="shipped"] {
            background-color: #000000;
            box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
        }

        .status-dot[data-status="processing"] {
            background-color: #666666;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .status-dot[data-status="pending"] {
            background-color: #999999;
        }

        .status-dot[data-status="cancelled"] {
            background-color: #000000;
        }

        .status-text {
            font-size: 14px;
            font-weight: 600;
            color: #333333;
        }

        .status-message {
            font-size: 13px;
            color: #666666;
            margin: 2px 0 10px 20px;
        }

        .rate-review-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: transparent;
            border: 2px solid #ffd700;
            color: #000000;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin-left: 20px;
            transition: all 0.3s ease;
            border-radius: 8px;
            animation: subtleGlow 2s infinite alternate;
        }

        @keyframes subtleGlow {
            from {
                box-shadow: 0 0 4px rgba(255, 215, 0, 0.2);
            }
            to {
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
            }
        }

        .rate-review-btn:hover {
            background: #ffd700;
            color: #000000;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
        }

        .rate-review-btn svg {
            flex-shrink: 0;
            color: #000000;
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
            animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
            background: #ffffff;
            border-radius: 12px;
            max-width: 500px;
            width: 100%;
            padding: 32px;
            position: relative;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            border: 2px solid #ffd700;
            animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: #f5f5f5;
            border: none;
            color: #333333;
            cursor: pointer;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }

        .modal-close:hover {
            background: #ffd700;
            color: #000000;
            transform: rotate(90deg);
            border-color: #ffd700;
        }

        .modal-loading {
            text-align: center;
            padding: 40px 20px;
        }

        .modal-loading .spin {
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
            color: #ffd700;
        }

        .modal-title {
            font-size: 22px;
            font-weight: 700;
            color: #000000;
            margin: 0 0 24px 0;
            text-align: center;
        }

        .modal-product-info {
            padding: 18px;
            background: #f9f9f9;
            border-radius: 10px;
            margin-bottom: 24px;
            border: 1px solid #e0e0e0;
            transition: all 0.3s ease;
        }

        .modal-product-info:hover {
            border-color: #ffd700;
            transform: translateY(-2px);
            background: #fffef5;
        }

        .modal-product-name {
            font-size: 17px;
            font-weight: 600;
            color: #000000;
            margin: 0 0 8px 0;
        }

        .modal-product-details {
            font-size: 14px;
            color: #666666;
            margin: 0;
        }

        .modal-field {
            margin-bottom: 22px;
        }

        .modal-field label {
            display: block;
            font-size: 15px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 10px;
        }

        .modal-field textarea {
            width: 100%;
            padding: 14px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-family: inherit;
            font-size: 14px;
            resize: vertical;
            transition: all 0.3s ease;
            background: #ffffff;
            color: #333333;
        }

        .modal-field textarea:focus {
            outline: none;
            border-color: #ffd700;
            box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
        }

        .star-rating {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .star {
            cursor: pointer;
            color: #e0e0e0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .star:hover {
            transform: scale(1.2);
            color: #ffd700 !important;
        }

        .star.filled {
            color: #ffd700;
        }

        .star.disabled {
            cursor: not-allowed;
        }

        .star.disabled:hover {
            transform: none;
        }

        .modal-actions {
            display: flex;
            gap: 14px;
            justify-content: flex-end;
            margin-top: 28px;
        }

        .btn-primary, .btn-secondary {
            padding: 11px 26px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 2px solid transparent;
        }

        .btn-primary {
            background: #ffd700;
            color: #000000;
        }

        .btn-primary:hover:not(:disabled) {
            background: #ffed4e;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
        }

        .btn-primary:disabled {
            background: #f0f0f0;
            color: #999999;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .btn-secondary {
            background: #ffffff;
            color: #333333;
            border-color: #cccccc;
        }

        .btn-secondary:hover:not(:disabled) {
            background: #333333;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .state-message {
            text-align: center;
            padding: 100px 40px;
            background: #ffffff;
            border-radius: 12px;
            margin: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .state-message .icon {
            color: #ffd700;
            margin-bottom: 24px;
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        .state-message .icon.spin {
            animation: spin 1s linear infinite;
        }

        .state-message h2 {
            font-size: 26px;
            font-weight: 700;
            color: #000000;
            margin: 0 0 16px 0;
        }

        .state-message p {
            font-size: 16px;
            color: #666666;
            margin: 0 0 32px 0;
        }

        @media (max-width: 768px) {
            .order-item-card {
                flex-wrap: wrap;
                padding: 18px;
            }

            .product-image-name-container {
                width: 100%;
                margin-right: 0;
                margin-bottom: 16px;
            }

            .order-item-price {
                margin-right: 20px;
                min-width: auto;
            }

            .order-item-status {
                width: 100%;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #f0f0f0;
            }

            .modal-content {
                padding: 24px;
                margin: 0 16px;
            }

            .modal-actions {
                flex-direction: column;
            }

            .btn-primary, .btn-secondary {
                width: 100%;
            }
        }

        @media (max-width: 480px) {
            .order-item-image {
                width: 80px;
                height: 80px;
            }

            .order-item-name {
                font-size: 15px;
            }

            .order-item-price {
                font-size: 16px;
            }

            .rate-review-btn {
                width: calc(100% - 20px);
                justify-content: center;
            }
        }
            /* ============================================
   NEW UI ENHANCEMENTS (Safe to add anywhere below)
   ============================================ */

/* Add clean spacing between product list items */
.order-item-wrapper {
    margin-bottom: 22px;
}

/* Wrap each card inside a wrapper (non-breaking enhancement) */
.order-item-wrapper .order-item-card {
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid rgba(255, 215, 0, 0.25);
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    transition: all 0.35s ease;
}

/* Enhanced hover effect */
.order-item-wrapper .order-item-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 22px rgba(0,0,0,0.12);
    background: #fffef5;
}

/* Slight shadow glow on product image */
.order-item-wrapper .order-item-card:hover .order-item-image {
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
}

/* Add bottom spacing for the full container */
.order-history-container {
    padding-bottom: 40px;
}

/* Subtle divider line between list & top header */
.order-history-container::before {
    content: "";
    display: block;
    width: 100%;
    height: 6px;
    background: linear-gradient(to right, #ffd700, transparent);
    margin-bottom: 18px;
    border-radius: 6px;
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
                        <AlertTriangle size={48} className="icon" />
                        <h2>An Error Occurred</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (flattenedOrders.length === 0) {
        return (
            <div className="order-history-page">
                <style>{customStyles}</style>
                <div className="order-history-container">
                    <div className="state-message">
                        <ShoppingBag size={48} className="icon" />
                        <h2>No Orders Yet</h2>
                        <p>Looks like you haven't placed any orders.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-history-page">
            <style>{customStyles}</style>
            <div className="order-history-container">
                {flattenedOrders.map((product, index) => (
                    <OrderItemCard
                        key={`${product.orderId}-${product.id || index}`}
                        product={product}
                        userId={userId}
                        fetchOrders={fetchOrders}
                    />
                ))}
            </div>
        </div>
    );
};

const OrderHistoryWrapper = () => {
    const mockUseAddress = () => ({ userId: localStorage.getItem("userId") || 4 });
    const userId = (useAddress || mockUseAddress)().userId;

    return (
        <OrderProvider userId={userId}>
            <OrderHistoryPage userId={userId} />
        </OrderProvider>
    );
};

export default OrderHistoryWrapper;