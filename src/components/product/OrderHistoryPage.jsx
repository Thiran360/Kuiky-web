// src/pages/OrderHistoryPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
// ⭐️ Import the Context and its Hook
import { useOrder, OrderProvider } from '../../context/OrderContext'; 
import { useAddress } from '../../context/AddressContext'; // Assuming this provides userId
import { Package, ShoppingBag, Loader, CornerDownLeft, X } from 'lucide-react';

// --- OrderItemCard Component ---
const OrderItemCard = ({ item }) => {
    const totalItems = item.items.reduce((sum, product) => sum + product.quantity, 0);
    const totalAmount = parseFloat(item.total).toFixed(0);
    const statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1);
    
    const getStatusClass = (status) => {
        switch (status) {
            case 'accepted': return 'status-accepted';
            case 'forwarded': return 'status-forwarded';
            case 'delivered': return 'status-delivered';
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
                {/* Display a preview of the items */}
                {item.items.slice(0, 2).map((product) => (
                    <div key={product.id} className="item-row">
                        <Package size={14} className="item-icon" />
                        <span className="item-name">{product.name} ({product.value})</span>
                        <span className="item-quantity">x{product.quantity}</span>
                    </div>
                ))}
                {item.items.length > 2 && (
                    <div className="more-items-notice">
                        + {item.items.length - 2} more item(s)
                    </div>
                )}
            </div>

            <div className="order-actions">
                <button 
                    className="btn-yellow-outline" 
                    onClick={() => console.log('View details for', item.id)}
                >
                    View Details
                </button>
                {/* Example of a conditional action button */}
                {(item.status === 'accepted' || item.status === 'forwarded') && (
                    <button 
                        className="btn-red-outline" 
                        onClick={() => console.log('Cancel order', item.id)}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};


// --- Main Order History Page Component ---
const OrderHistoryPage = () => {
    // ⭐️ Retrieve orders and state from the context
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
            background: white; /* White background as requested */
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
        .btn-red-outline {
            padding: 8px 15px;
            background: none;
            border: 1px solid #dc3545;
            border-radius: 4px;
            color: #dc3545;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
        }
        .btn-red-outline:hover {
            background-color: #dc3545;
            color: white;
        }
        
        /* State messages */
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
    `;

    // --- Conditional Renderings for States (Loading, Error, Empty) ---

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
                        <X size={48} className="icon" style={{ color: '#dc3545' }} />
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


    // --- Main Order List Render ---
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
                        <OrderItemCard key={order.id} item={order} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Export Wrapper (for integration) ---

/**
 * This component is used to wrap OrderHistoryPage with the necessary context.
 * It assumes a separate context (like ProfileContext) provides the userId.
 */
const OrderHistoryWrapper = () => {
    // const MOCK_USER_ID = 4; 
    const userId = useAddress().userId; // Assuming userId is available from AddressContext
    return (
        <OrderProvider userId={userId}>
            <OrderHistoryPage />
        </OrderProvider>
    );
};

export default OrderHistoryWrapper;