import { useState, useEffect, useRef } from "react";
import DashboardNav from "../../components/DashboardNav";
import {
  getOrders,
  updateOrderStatus,
  updateOrderPayment,
} from "../../services/api";
import {ErrorToast, InfoToast, SuccessToast} from "../Common/Toast/Toast";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  // Add state to track remaining time for orders
  const [timerValues, setTimerValues] = useState({});
  // Use ref to store orders data to avoid unnecessary re-renders
  const ordersRef = useRef([]);

  // Track previous order count for notifications
  const previousOrderCountRef = useRef(0);

  // Initial fetch and polling for orders
  useEffect(() => {
    fetchOrders(true);

    // Set up polling to check for new orders - reduced to 10 seconds for better real-time feel
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000); // Every 10 seconds for better responsiveness

    return () => clearInterval(interval);
  }, [statusFilter]);

  // Check for new orders and show notification
  useEffect(() => {
    if (orders.length > 0 && previousOrderCountRef.current > 0) {
      const newOrderCount = orders.length - previousOrderCountRef.current;
      if (newOrderCount > 0 && statusFilter === "pending") {
        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification(`New Order${newOrderCount > 1 ? 's' : ''} Received`, {
            body: `${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} waiting for processing`,
            icon: '/favicon.ico',
            tag: 'new-order',
          });
        }
        // Show toast notification
        InfoToast(`${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} received!`);
      }
    }
    previousOrderCountRef.current = orders.length;
  }, [orders.length, statusFilter]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Separate timer effect that updates every second
  useEffect(() => {
    // Only run timer updates if we have orders
    if (orders.length === 0) return;

    // Timer update function
    const updateTimers = () => {
      const currentTime = new Date();
      const updatedTimers = {};

      orders.forEach((order) => {
        // Only calculate for completed and paid orders
        if (order.status === "completed" && order.paymentStatus === "paid") {
          const lastUpdateTime = new Date(order.updatedAt || order.createdAt);
          const minutesElapsed = (currentTime - lastUpdateTime) / (1000 * 60);

          if (minutesElapsed >= 5) {
            updatedTimers[order._id] = "Locked";
          } else {
            const remainingMinutes = 5 - minutesElapsed;
            const minutes = Math.floor(remainingMinutes);
            const seconds = Math.floor((remainingMinutes - minutes) * 60);
            updatedTimers[order._id] = `${minutes}m ${seconds}s until locked`;
          }
        }
      });

      setTimerValues(updatedTimers);
    };

    // Run immediately and then every second
    updateTimers();
    const timerInterval = setInterval(updateTimers, 1000);

    return () => clearInterval(timerInterval);
  }, [orders]);

  const fetchOrders = async (isInitialLoad) => {
    try {
      // Only set loading on initial load
      if (isInitialLoad) setLoading(true);

      const response = await getOrders({ status: statusFilter });

      // Update the ref first
      ordersRef.current = response.data;

      // Then update the state (this triggers a render)
      setOrders(response.data);

      if (isInitialLoad) {
        setLoading(false);
        setInitialLoad(false);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      // Optimistic update
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );

      await updateOrderStatus(orderId, status);

      SuccessToast(`Order status updated to ${status}`);

    } catch (err) {
      // Revert optimistic update on error
      setOrders(ordersRef.current);
      const errorMsg = err.response?.data?.message || "Failed to update order status";
      ErrorToast(errorMsg);
      console.error(err);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      // Optimistic update
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, paymentStatus } : order
        )
      );

      await updateOrderPayment(orderId, paymentStatus);
      SuccessToast(`Payment status updated to ${paymentStatus}`);
    } catch (err) {
      // Revert optimistic update on error
      setOrders(ordersRef.current);
      const errorMsg = err.response?.data?.message || "Failed to update payment status";
      ErrorToast(errorMsg);
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
      case "pending":
        return "bg-yellow-100";
      case "preparing":
        return "bg-blue-100";
      case "served":
        return "bg-green-100";
      case "completed":
        return "bg-gray-100";
      case "cancelled":
        return "bg-red-100";
      default:
        return "";
    }
  };

  // Check if an order should be locked (completed + paid + 5 min elapsed)
  const isOrderLocked = (order) => {
    // If order is not both completed and paid, it's not locked
    if (order.status !== "completed" || order.paymentStatus !== "paid") {
      return false;
    }

    // Find the last update timestamp
    const lastUpdateTime = new Date(order.updatedAt || order.createdAt);
    const currentTime = new Date();

    // Calculate minutes elapsed since last update
    const minutesElapsed = (currentTime - lastUpdateTime) / (1000 * 60);

    // Lock after 5 minutes
    return minutesElapsed >= 5;
  };

  // Get remaining time from timer values state
  const getRemainingTimeUntilLock = (order) => {
    if (order.status !== "completed" || order.paymentStatus !== "paid") {
      return null;
    }

    // Use the cached timer value if available
    return timerValues[order._id] || "Calculating...";
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <DashboardNav />
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Order Management</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Auto-refreshing every 10 seconds</span>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Filter Orders</h2>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded ${
              statusFilter === "pending"
                ? "bg-orange-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded ${
              statusFilter === "preparing"
                ? "bg-orange-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setStatusFilter("preparing")}
          >
            Preparing
          </button>
          <button
            className={`px-4 py-2 rounded ${
              statusFilter === "served"
                ? "bg-orange-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setStatusFilter("served")}
          >
            Served
          </button>
          <button
            className={`px-4 py-2 rounded ${
              statusFilter === "completed"
                ? "bg-orange-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 rounded ${
              statusFilter === "" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setStatusFilter("")}
          >
            All Orders
          </button>
        </div>
      </div>

      {initialLoad && loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          <p className="text-center py-4">Loading orders...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {orders.map((order) => {
            // Check if order is locked
            const locked = isOrderLocked(order);
            const remainingTime = getRemainingTimeUntilLock(order);

            return (
              <div
                key={order._id}
                className={`border-2 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${getStatusColor(
                  order.status
                )} ${locked ? "opacity-80" : ""}`}
              >
                <div className="p-4 md:p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">
                      Order #{order._id.substring(order._id.length - 5)}
                    </h3>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        order.paymentStatus === "paid"
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  {/* Show lock status if relevant */}
                  {order.status === "completed" &&
                    order.paymentStatus === "paid" && (
                      <div
                        className={`text-xs mb-2 font-medium ${
                          locked ? "text-red-600" : "text-blue-600"
                        }`}
                      >
                        {locked ? (
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            Order locked (no further changes allowed)
                          </div>
                        ) : (
                          remainingTime
                        )}
                      </div>
                    )}

                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Table:</span>{" "}
                    {order.table?.tableNumber || "N/A"}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Customer:</span>{" "}
                    {order.customer?.name || "Guest"}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Time:</span>{" "}
                    {formatDate(order.createdAt)}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Status:</span>{" "}
                    {order.status}
                  </p>

                  <div className="mt-3 mb-2">
                    <h4 className="font-semibold">Items:</h4>
                    <ul className="list-disc list-inside">
                      {order.items.map((item, index) => (
                        <li key={index} className="ml-2">
                          {item.quantity}x{" "}
                          {item.menuItem?.name || "Unknown Item"} - ₹
                          {item.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-lg font-bold mt-2">
                    Total: ₹{order.totalAmount.toFixed(2)}
                  </p>

                  {order.notes && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded">
                      <p className="text-sm font-semibold">Notes:</p>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Update Status:</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "pending")
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          order.status === "pending"
                            ? "bg-yellow-600 text-white shadow-md"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        disabled={order.status === "pending" || locked}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "preparing")
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          order.status === "preparing"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        disabled={order.status === "preparing" || locked}
                      >
                        Preparing
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "served")
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          order.status === "served"
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        disabled={order.status === "served" || locked}
                      >
                        Served
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "completed")
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          order.status === "completed"
                            ? "bg-gray-600 text-white shadow-md"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        disabled={order.status === "completed" || locked}
                      >
                        Completed
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "cancelled")
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          order.status === "cancelled"
                            ? "bg-red-600 text-white shadow-md"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        disabled={order.status === "cancelled" || locked}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Update Payment:</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleUpdatePaymentStatus(order._id, "paid")
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex-1 ${
                          order.paymentStatus === "paid"
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-200 hover:bg-green-100 text-gray-700"
                        }`}
                        disabled={order.paymentStatus === "paid" || locked}
                      >
                        Mark as Paid
                      </button>
                      <button
                        onClick={() =>
                          handleUpdatePaymentStatus(order._id, "unpaid")
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex-1 ${
                          order.paymentStatus === "unpaid"
                            ? "bg-red-600 text-white shadow-md"
                            : "bg-gray-200 hover:bg-red-100 text-gray-700"
                        }`}
                        disabled={order.paymentStatus === "unpaid" || locked}
                      >
                        Mark as Unpaid
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center py-8 bg-gray-50 rounded">
          No {statusFilter ? statusFilter : ""} orders found
        </p>
      )}
    </div>
  );
};

export default ManageOrders;
