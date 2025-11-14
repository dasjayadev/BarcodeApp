import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPublicOrder } from '../services/api';
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  UtensilsCrossed, 
  Package,
  AlertCircle,
  ArrowLeft,
  ShoppingCart,
  Share2
} from 'lucide-react';
import { saveOrder, getOrderById } from '../utils/orderStorage';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      // Poll for order updates every 10 seconds
      const interval = setInterval(fetchOrder, 10000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setError('');
      const response = await getPublicOrder(orderId);
      const orderData = response.data;
      setOrder(orderData);
      
      // Save order to localStorage for cache (only if not expired)
      if (orderData && orderData.table) {
        // Don't save completed+paid orders older than 24 hours
        const isExpired = orderData.status === 'completed' && 
                         orderData.paymentStatus === 'paid' &&
                         orderData.updatedAt;
        
        if (isExpired) {
          const updatedAt = new Date(orderData.updatedAt);
          const age = Date.now() - updatedAt.getTime();
          const twentyFourHours = 24 * 60 * 60 * 1000;
          
          if (age < twentyFourHours) {
            saveOrder(orderId, orderData.table._id || orderData.table, orderData);
          }
        } else {
          saveOrder(orderId, orderData.table._id || orderData.table, orderData);
        }
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found');
      setLoading(false);
    }
  };

  const handleContinueOrdering = () => {
    if (order?.table) {
      const tableId = order.table._id || order.table;
      navigate(`/menu?table=${tableId}`);
    }
  };

  const handleShareOrder = async () => {
    const orderLink = window.location.href;
    const orderNumber = orderId.substring(orderId.length - 6).toUpperCase();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order #${orderNumber}`,
          text: `Track your order: ${orderLink}`,
          url: orderLink,
        });
      } catch (err) {
        // User cancelled or error occurred, fallback to copy
        if (err.name !== 'AbortError') {
          await handleCopyToClipboard(orderLink);
        }
      }
    } else {
      // Fallback: copy to clipboard
      await handleCopyToClipboard(orderLink);
    }
  };

  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show a brief success message
      const button = document.querySelector('[title="Share order link"]');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      alert('Failed to copy link. Please copy manually: ' + text);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-orange-500" size={24} />;
      case 'preparing':
        return <ChefHat className="text-blue-500" size={24} />;
      case 'served':
        return <UtensilsCrossed className="text-pink-500" size={24} />;
      case 'completed':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'cancelled':
        return <AlertCircle className="text-red-500" size={24} />;
      default:
        return <Package className="text-gray-500" size={24} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'served':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusSteps = () => {
    const statuses = ['pending', 'preparing', 'served', 'completed'];
    const currentIndex = statuses.indexOf(order?.status || 'pending');
    
    return statuses.map((status, index) => {
      const isActive = index <= currentIndex;
      const isCurrent = index === currentIndex;
      
      return {
        status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
        isActive,
        isCurrent
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleShareOrder}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition"
                title="Share order link"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Tracking</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Order Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg border-2 font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="capitalize">{order.status}</span>
            </div>
          </div>

          {order.table && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600">Table</p>
              <p className="text-lg font-semibold text-gray-900">Table {order.table.tableNumber}</p>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status</h3>
          <div className="space-y-4">
            {statusSteps.map((step, index) => (
              <div key={step.status} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      step.isActive
                        ? step.isCurrent
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-green-500 border-green-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    {step.isActive ? (
                      step.isCurrent ? (
                        <Clock size={20} />
                      ) : (
                        <CheckCircle size={20} />
                      )
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                    )}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-12 mt-2 ${
                        step.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <p
                    className={`font-semibold ${
                      step.isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.isCurrent && (
                    <p className="text-sm text-gray-600 mt-1">
                      {step.status === 'pending' && 'Your order has been received and is waiting to be prepared.'}
                      {step.status === 'preparing' && 'Your order is being prepared in the kitchen.'}
                      {step.status === 'served' && 'Your order has been served. Enjoy your meal!'}
                      {step.status === 'completed' && 'Your order has been completed. Thank you!'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {item.menuItem?.name || 'Unknown Item'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-bold text-gray-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mt-4 flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Status</h3>
              <p className="text-sm text-gray-600">
                {order.paymentStatus === 'paid' 
                  ? 'Your payment has been received.' 
                  : 'Payment pending.'}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-semibold ${
                order.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Special Instructions</h3>
            <p className="text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Continue Ordering Button */}
        {order.table && (order.status === 'pending' || order.status === 'preparing') && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Want to add more items?</h3>
              <p className="text-gray-600 mb-4">You can continue ordering from the same table</p>
              <button
                onClick={handleContinueOrdering}
                className="w-full md:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2 mx-auto"
              >
                <ShoppingCart size={20} />
                Continue Ordering
              </button>
            </div>
          </div>
        )}

        {/* Order ID for reference */}
        <div className="bg-gray-50 rounded-xl p-4 mt-6 text-center">
          <p className="text-xs text-gray-500 mb-1">Order Reference</p>
          <p className="text-sm font-mono text-gray-700">#{orderId.substring(orderId.length - 6).toUpperCase()}</p>
          <p className="text-xs text-gray-500 mt-2">
            Save this page or bookmark it to track your order later
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

