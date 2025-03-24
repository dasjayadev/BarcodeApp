import React, { useState, useEffect } from 'react';
import DashboardNav from '../../components/DashboardNav';
import { getOrders, updateOrderStatus, updateOrderPayment } from '../../services/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchOrders();
    // Set up polling to check for new orders
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders({ status: statusFilter });
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
      console.error(err);
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      
      setSuccess(`Order status updated to ${status}`);
      fetchOrders();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
      console.error(err);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      await updateOrderPayment(orderId, paymentStatus);
      
      setSuccess(`Payment status updated to ${paymentStatus}`);
      fetchOrders();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment status');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to get background color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100';
      case 'preparing':
        return 'bg-blue-100';
      case 'served':
        return 'bg-green-100';
      case 'completed':
        return 'bg-gray-100';
      case 'cancelled':
        return 'bg-red-100';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Order Management</h1>
      <DashboardNav />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Filter Orders</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded ${statusFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`px-4 py-2 rounded ${statusFilter === 'preparing' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('preparing')}
          >
            Preparing
          </button>
          <button 
            className={`px-4 py-2 rounded ${statusFilter === 'served' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('served')}
          >
            Served
          </button>
          <button 
            className={`px-4 py-2 rounded ${statusFilter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`px-4 py-2 rounded ${statusFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('')}
          >
            All Orders
          </button>
        </div>
      </div>
      
      {loading ? (
        <p className="text-center py-4">Loading orders...</p>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => (
            <div 
              key={order._id} 
              className={`border rounded-lg shadow-md overflow-hidden ${getStatusColor(order.status)}`}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold">
                    Order #{order._id.substring(order._id.length - 5)}
                  </h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    order.paymentStatus === 'paid' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Table:</span> {order.table?.tableNumber || 'N/A'}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Customer:</span> {order.customer?.name || 'Guest'}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Time:</span> {formatDate(order.createdAt)}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Status:</span> {order.status}
                </p>
                
                <div className="mt-3 mb-2">
                  <h4 className="font-semibold">Items:</h4>
                  <ul className="list-disc list-inside">
                    {order.items.map((item, index) => (
                      <li key={index} className="ml-2">
                        {item.quantity}x {item.menuItem?.name || 'Unknown Item'} - ${item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <p className="text-lg font-bold mt-2">Total: ${order.totalAmount.toFixed(2)}</p>
                
                {order.notes && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded">
                    <p className="text-sm font-semibold">Notes:</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Update Status:</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'pending')}
                      className={`px-2 py-1 text-xs rounded ${order.status === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
                      disabled={order.status === 'pending'}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'preparing')}
                      className={`px-2 py-1 text-xs rounded ${order.status === 'preparing' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      disabled={order.status === 'preparing'}
                    >
                      Preparing
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'served')}
                      className={`px-2 py-1 text-xs rounded ${order.status === 'served' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                      disabled={order.status === 'served'}
                    >
                      Served
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                      className={`px-2 py-1 text-xs rounded ${order.status === 'completed' ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}
                      disabled={order.status === 'completed'}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                      className={`px-2 py-1 text-xs rounded ${order.status === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                      disabled={order.status === 'cancelled'}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <h4 className="font-semibold mb-2">Update Payment:</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePaymentStatus(order._id, 'paid')}
                      className={`px-2 py-1 text-xs rounded ${order.paymentStatus === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                      disabled={order.paymentStatus === 'paid'}
                    >
                      Mark as Paid
                    </button>
                    <button
                      onClick={() => handleUpdatePaymentStatus(order._id, 'unpaid')}
                      className={`px-2 py-1 text-xs rounded ${order.paymentStatus === 'unpaid' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                      disabled={order.paymentStatus === 'unpaid'}
                    >
                      Mark as Unpaid
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-8 bg-gray-50 rounded">No {statusFilter ? statusFilter : ''} orders found</p>
      )}
    </div>
  );
};

export default OrderManagement;
