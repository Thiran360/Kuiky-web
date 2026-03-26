import React, { useState, useEffect, useMemo } from 'react';
import { useOrder, OrderProvider } from '../../context/OrderContext';
import { useAddress } from '../../context/AddressContext';
import { ShoppingBag, Loader, AlertTriangle, Star, X, Package, Truck, CheckCircle2, Navigation, Clock, ShieldCheck, ChevronRight, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../api/config';
import { generateInvoice } from '../../utils/invoiceGenerator';
import './OrderHistoryPage.css';

// -----------------------------------------------------------
// 1. StarRating Component
// -----------------------------------------------------------
const StarRating = ({ value, onRate, disabled }) => {
    return (
        <div className="star-rating">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <Star
                        key={index}
                        size={20}
                        className={`star ${ratingValue <= value ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
                        onClick={() => !disabled && onRate(ratingValue)}
                        fill={ratingValue <= value ? 'var(--color-primary, #ffd700)' : 'currentColor'}
                        strokeWidth={0}
                    />
                );
            })}
        </div>
    );
};

// -----------------------------------------------------------
// 2. ProductReviewModal Component
// -----------------------------------------------------------
const ProductReviewModal = ({ product, onClose }) => {
    // Get all necessary functions from context
    const {
        addProductReview,
        updateProductReview,
        deleteProductReview,
        fetchProductReview,
        fetchOrders
    } = useOrder();

    const [reviewId, setReviewId] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const isEditing = reviewId !== null;

    // Load existing review on mount
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
                // setAlertMessage("Could not load previous review data."); // Optional error message for load
            } finally {
                setInitialLoading(false);
            }
        };

        if (product.product_id) {
            loadReview();
        } else {
            setInitialLoading(false);
        }

    }, [product.product_id, fetchProductReview]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setAlertMessage("Please select a star rating.");
            return;
        }

        setIsSubmitting(true);
        setAlertMessage(null);
        setSubmitSuccess(false);

        let result;

        if (isEditing) {
            // Payload for update
            result = await updateProductReview(reviewId, {
                rating,
                description
            });
        } else {
            // Payload for add (aligned with typical context function parameters)
            result = await addProductReview({
                productId: product.product_id,
                review: rating,
                comment: description
            });
        }

        if (result.success) {
            setAlertMessage(result.message);
            setSubmitSuccess(true);

            if (result.review && !isEditing) {
                setReviewId(result.review.id);
            }

            if (fetchOrders) fetchOrders();
            setTimeout(onClose, 1000);
        } else {
            setAlertMessage(`Action Failed: ${result.message}`);
            setSubmitSuccess(false);
        }
        setIsSubmitting(false);
    };

    // --- Handle delete review ---
    const handleDeleteReview = async () => {
        if (!reviewId) return;
        setIsDeleting(true);
        setAlertMessage(null);
        const result = await deleteProductReview(reviewId);
        if (result.success) {
            setAlertMessage(result.message);
            setSubmitSuccess(true);
            if (fetchOrders) fetchOrders();
            setTimeout(onClose, 900);
        } else {
            setAlertMessage(`Delete Failed: ${result.message}`);
            setSubmitSuccess(false);
            setConfirmDelete(false);
        }
        setIsDeleting(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} disabled={isSubmitting || isDeleting}>
                    <X size={24} />
                </button>

                {initialLoading ? (
                    <div className="modal-loading">
                        <Loader size={24} className="spin" />
                        <p>Loading review status...</p>
                    </div>
                ) : (
                    <form onSubmit={handleReviewSubmit}>
                        <h3 className="modal-title">{isEditing ? 'Update Your Review' : 'Rate & Review Product'}</h3>

                        {alertMessage && (
                            <div className={`alert-message ${submitSuccess ? 'success' : 'error'}`}>
                                <AlertTriangle size={18} /> {alertMessage}
                            </div>
                        )}

                        <div className="modal-product-info">
                            <p className="modal-product-name">{product.name || product.product_name}</p>
                            <p className="modal-product-details">
                                {product.color && `Color: ${product.color}`}
                                {product.color && product.size && ' • '}
                                {product.size && `Size: ${product.size}`}
                            </p>
                        </div>

                        <div className="modal-field">
                            <label>Your Rating</label>
                            <StarRating value={rating} onRate={setRating} disabled={isSubmitting || isDeleting} />
                        </div>

                        <div className="modal-field">
                            <label htmlFor="review-description">Your Review</label>
                            <textarea
                                id="review-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Share your experience with this product..."
                                rows="4"
                                disabled={isSubmitting || isDeleting}
                            />
                        </div>

                        {isEditing && confirmDelete && (
                            <div className="alert-message error mb-12">
                                <AlertTriangle size={18} />
                                Are you sure? This cannot be undone.
                                <button
                                    type="button"
                                    onClick={handleDeleteReview}
                                    disabled={isDeleting}
                                    className="btn-danger-small"
                                >
                                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(false)}
                                    disabled={isDeleting}
                                    className="btn-gray-small"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        <div className="modal-actions">
                            {/* Delete button — only shown when editing an existing review */}
                            {isEditing && !confirmDelete && (
                                <button
                                    type="button"
                                    className="btn-secondary btn-outline-danger"
                                    onClick={() => setConfirmDelete(true)}
                                    disabled={isSubmitting || isDeleting}
                                >
                                    Delete Review
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={onClose}
                                disabled={isSubmitting || isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting || isDeleting || rating === 0}
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

// -----------------------------------------------------------
// 3. OrderItemCard Component
// -----------------------------------------------------------
/* ─── ORDER CARD: CONSOLIDATED ASSET DOSSIER ─── */
const OrderCard = ({ order, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    
    // Normalize items
    const items = order.items || order.products || order.order_items || [];
    
    // Product to review (defaults to first item if multiple)
    const activeProduct = items[0] ? {
        ...items[0],
        product_id: items[0].product_id || items[0].id,
        name: items[0].name || items[0].product_name || items[0].title
    } : null;
    
    const formatDate = (dateString) => {
        if (!dateString) return 'PROTOCOL PENDING';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }).toUpperCase();
        } catch { return dateString.toUpperCase(); }
    };

    const statusConfig = {
        'delivered': { icon: <CheckCircle2 size={14} />, color: 'emerald', text: 'HANDSHAKE COMPLETE' },
        'shipped': { icon: <Truck size={14} />, color: 'blue', text: 'IN TRANSIT' },
        'processing': { icon: <Clock size={14} />, color: 'amber', text: 'PREPARING ASSETS' },
        'pending': { icon: <Clock size={14} />, color: 'slate', text: 'AWAITING AUTH' },
        'cancelled': { icon: <X size={14} />, color: 'rose', text: 'PROTOCOL TERMINATED' }
    };

    const currentStatus = statusConfig[order.status?.toLowerCase()] || statusConfig['processing'];

    const handleDownload = (e) => {
        e.stopPropagation();
        generateInvoice(order);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`order-item-ecom360-card ${isHovered ? 'radium-active' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="card-radium-glow"></div>
            
            <div className="order-institutional-dossier">
                <div className="dossier-id-block">
                    <span className="dossier-label">MANIFEST ID</span>
                    <span className="dossier-value">#{ (order.id || order.order_id)?.toString().slice(-8).toUpperCase()}</span>
                </div>
                <div className="dossier-date-block">
                    <span className="dossier-label">PROCUREMENT DATE</span>
                    <span className="dossier-value">{formatDate(order.date || order.created_at)}</span>
                </div>
                <div className={`dossier-status-pill ${currentStatus.color}`}>
                    {currentStatus.icon}
                    <span>{currentStatus.text}</span>
                </div>
            </div>

            <div className="order-product-ecom360 multi-item-view">
                <div className="order-asset-previews">
                    {items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="product-visual-shield mini">
                           <img
                                src={getImageUrl(item.image || item.product_image || item.image_url)}
                                alt={item.name}
                                onError={(e) => { e.target.src = "/images/no-image.png"; }}
                            />
                        </div>
                    ))}
                    {items.length > 3 && (
                        <div className="extra-count-badge">+{items.length - 3} MORE</div>
                    )}
                </div>

                <div className="product-identity-ecom360">
                    <h3 className="product-title-luxe">
                        {items[0]?.name || "Asset Cluster"}
                        {items.length > 1 ? ` & ${items.length - 1} OTHER ASSETS` : ''}
                    </h3>
                    <div className="product-specs-dossier">
                        <span className="spec-chip">TOTAL UNITS: {items.reduce((s, i) => s + (i.quantity || 1), 0)}</span>
                        <span className="spec-chip">LOGISTICS READY</span>
                    </div>
                </div>

                <div className="order-financial-ecom360">
                    <span className="financial-label">COLLECTIVE SETTLEMENT</span>
                    <span className="financial-amount">₹{(order.total || order.total_amount || 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="order-actions-ecom360">
                    {order.status?.toLowerCase() === 'delivered' && (
                        <button className="btn-luxe-action review" onClick={() => setShowReviewModal(true)}>
                            <Star size={16} /> <span>REVIEW</span>
                        </button>
                    )}
                    <button className="btn-luxe-action invoice" onClick={handleDownload}>
                        <FileDown size={16} /> <span>INVOICE</span>
                    </button>
                    <button className="btn-luxe-action-icon" onClick={() => window.location.href = `/order/${order.id}`}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showReviewModal && activeProduct && (
                    <ProductReviewModal
                        product={activeProduct}
                        onClose={() => setShowReviewModal(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// -----------------------------------------------------------
// 4. OrderHistoryPage Component (The main parent view)
// -----------------------------------------------------------
const OrderHistoryPage = () => {
    const { orders, loading, error, fetchOrders } = useOrder();

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const stats = useMemo(() => {
        const total = orders?.length || 0;
        const active = orders?.filter(o => ['processing', 'shipped', 'pending'].includes(o.status?.toLowerCase())).length || 0;
        const delivered = orders?.filter(o => o.status?.toLowerCase() === 'delivered').length || 0;
        return { total, active, delivered };
    }, [orders]);

    if (loading) return (
        <div className="order-history-page elite-loading">
            <div className="elite-loading-ecom360">
                <Loader size={60} className="spin text-blue-500" />
                <h2 className="loading-title">SYNCHRONIZING LOGISTICS</h2>
                <div className="loading-bar"><div className="loading-progress"></div></div>
            </div>
        </div>
    );

    if (error) return (
        <div className="order-history-page">
            <div className="elite-error-ecom360">
                <AlertTriangle size={64} className="text-rose-500 mb-6" />
                <h2>COMMUNICATION FAULT</h2>
                <p>{error}</p>
                <button className="btn-luxe-primary" onClick={fetchOrders}>RE-ESTABLISH HANDSHAKE</button>
            </div>
        </div>
    );

    return (
        <div className="order-history-page">
            <div className="order-history-container">
                <header className="order-history-luxe-header">
                    <div className="header-identity">
                        <span className="protocol-badge">LOGISTICS DASHBOARD</span>
                        <h1 className="header-title-luxe">Procurement History</h1>
                    </div>

                    <div className="order-stats-ecom360">
                        <div className="stat-dossier">
                            <Package size={20} />
                            <div className="stat-data">
                                <span className="val">{stats.total}</span>
                                <span className="lbl">TOTAL ASSETS</span>
                            </div>
                        </div>
                        <div className="stat-dossier">
                            <Clock size={20} />
                            <div className="stat-data">
                                <span className="val">{stats.active}</span>
                                <span className="lbl">ACTIVE DEPLOYMENTS</span>
                            </div>
                        </div>
                        <div className="stat-dossier">
                            <CheckCircle2 size={20} />
                            <div className="stat-data">
                                <span className="val">{stats.delivered}</span>
                                <span className="lbl">COMPLETED HANDSHAKES</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="order-history-body">
                    {(!orders || orders.length === 0) ? (
                        <div className="empty-history-ecom360">
                            <div className="empty-icon-shield"><ShoppingBag size={80} strokeWidth={1} /></div>
                            <h2>NO PROCUREMENT DATA FOUND</h2>
                            <p>Your institutional order logs are currently empty. Begin procurement to establish deployment data.</p>
                            <button className="btn-luxe-primary" onClick={() => window.location.href = '/'}>INITIATE ACQUISITION</button>
                        </div>
                    ) : (
                        <div className="orders-ecom360-list">
                            {orders.slice().filter(Boolean).reverse().map((order, index) => (
                                <OrderCard
                                    key={order.id || index}
                                    order={order}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// -----------------------------------------------------------
// 5. Export
// -----------------------------------------------------------
export default OrderHistoryPage;