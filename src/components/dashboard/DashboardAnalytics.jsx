import React, { useEffect, useState } from "react";
import { getOrders } from "../../services/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  Users,
} from "lucide-react";
import { CircleDashed } from "lucide-react";

const DashboardAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    today: { revenue: 0, orders: 0, averageOrder: 0 },
    week: { revenue: 0, orders: 0, averageOrder: 0 },
    month: { revenue: 0, orders: 0, averageOrder: 0 },
    total: { revenue: 0, orders: 0, averageOrder: 0 },
    statusBreakdown: {
      pending: 0,
      preparing: 0,
      served: 0,
      completed: 0,
    },
    paymentBreakdown: {
      paid: 0,
      unpaid: 0,
    },
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchOrders();
    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      calculateAnalytics();
    }
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const filterOrders = (startDate) => {
      return orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= now;
      });
    };

    const calculateMetrics = (orderList) => {
      const revenue = orderList.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
      const orderCount = orderList.length;
      const averageOrder = orderCount > 0 ? revenue / orderCount : 0;

      return { revenue, orders: orderCount, averageOrder };
    };

    const todayOrders = filterOrders(today);
    const weekOrders = filterOrders(weekAgo);
    const monthOrders = filterOrders(monthAgo);

    const statusBreakdown = {
      pending: orders.filter((o) => o.status === "pending").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      served: orders.filter((o) => o.status === "served").length,
      completed: orders.filter((o) => o.status === "completed").length,
    };

    const paymentBreakdown = {
      paid: orders.filter((o) => o.paymentStatus === "paid").length,
      unpaid: orders.filter((o) => o.paymentStatus === "unpaid").length,
    };

    setAnalytics({
      today: calculateMetrics(todayOrders),
      week: calculateMetrics(weekOrders),
      month: calculateMetrics(monthOrders),
      total: calculateMetrics(orders),
      statusBreakdown,
      paymentBreakdown,
    });
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "#F57400" }) => (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent sx={{ p: isSmall ? 2 : 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: isSmall ? "0.75rem" : "0.875rem", mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ fontSize: isSmall ? "1.25rem" : "1.5rem" }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: isSmall ? "0.65rem" : "0.75rem", mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={isSmall ? 24 : 28} color={color} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <CircleDashed size={40} className="animate animate-spin text-orange-500" />
      </Box>
    );
  }

  return (
    <Box sx={{ overflow: "hidden" }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
        fontSize={isMobile ? "1.5rem" : "2rem"}
        sx={{ padding: isSmall ? "0 8px" : "0 16px" }}
      >
        Analytics & Performance
      </Typography>

      {/* Revenue Cards */}
      <Grid
        container
        spacing={isSmall ? 2 : 3}
        sx={{ mb: 3, padding: isSmall ? "0 8px" : "0 16px" }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Revenue"
            value={`₹${analytics.today.revenue.toFixed(2)}`}
            subtitle={`${analytics.today.orders} orders`}
            icon={DollarSign}
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Week"
            value={`₹${analytics.week.revenue.toFixed(2)}`}
            subtitle={`${analytics.week.orders} orders`}
            icon={TrendingUp}
            color="#3B82F6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month"
            value={`₹${analytics.month.revenue.toFixed(2)}`}
            subtitle={`${analytics.month.orders} orders`}
            icon={ShoppingCart}
            color="#8B5CF6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${analytics.total.revenue.toFixed(2)}`}
            subtitle={`${analytics.total.orders} total orders`}
            icon={DollarSign}
            color="#F57400"
          />
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid
        container
        spacing={isSmall ? 2 : 3}
        sx={{ mb: 3, padding: isSmall ? "0 8px" : "0 16px" }}
      >
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: isSmall ? 2 : 3,
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Order Status Breakdown
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#ed6c02",
                    }}
                  />
                  <Typography variant="body1">Pending</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {analytics.statusBreakdown.pending}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#0288d1",
                    }}
                  />
                  <Typography variant="body1">Preparing</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {analytics.statusBreakdown.preparing}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#d81b60",
                    }}
                  />
                  <Typography variant="body1">Served</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {analytics.statusBreakdown.served}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#2e7d32",
                    }}
                  />
                  <Typography variant="body1">Completed</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {analytics.statusBreakdown.completed}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: isSmall ? 2 : 3,
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Payment Status
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#2e7d32",
                    }}
                  />
                  <Typography variant="body1">Paid</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {analytics.paymentBreakdown.paid}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#d32f2f",
                    }}
                  />
                  <Typography variant="body1">Unpaid</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {analytics.paymentBreakdown.unpaid}
                </Typography>
              </Box>
            </Box>

            <Box mt={3} pt={3} borderTop="1px solid #e0e0e0">
              <Typography variant="body2" color="text.secondary" mb={1}>
                Average Order Value
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                ₹{analytics.total.averageOrder.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAnalytics;

