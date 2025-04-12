import React, { useEffect, useState } from "react";
import { getOrders } from "../../services/api";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Typography,
  Grid,
  Paper,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TableBarIcon from "@mui/icons-material/TableBar";
import AssignmentIcon from "@mui/icons-material/Assignment";

const DashboardOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up polling to refresh orders
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const groupOrdersByStatus = (status) => {
    return orders.filter((order) => order.status === status);
  };

  const renderOrderCard = (order) => (
    <Card
      key={order._id}
      variant="outlined"
      sx={{
        mb: 2,
        borderRadius: 1,
      }}
    >
      <CardContent sx={{ p: isSmall ? 1.5 : 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography
            variant={isSmall ? "body1" : "h6"}
            sx={{ fontWeight: "600", fontSize: "1rem" }}
          >
            Order #{order._id.substring(order._id.length - 4)}
          </Typography>
          <Chip
            size={isSmall ? "small" : "medium"}
            label={order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
            color={order.paymentStatus === "paid" ? "success" : "error"}
          />
        </Box>

        <Stack direction="column" spacing={0.5} mb={1}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <>
              <ScheduleIcon
                fontSize="small"
                sx={{ mr: 0.5, color: "text.secondary" }}
              />
              <Typography variant="body2" color="text.secondary" mr={0.5}>
                {new Date(order.createdAt).toLocaleTimeString()}
              </Typography>
            </>
            <Typography variant="body2" color="text.secondary">
              {new Date(order.createdAt).toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TableBarIcon
              fontSize="small"
              sx={{ mr: 0.5, color: "text.secondary" }}
            />
            <Typography variant="body2" color="text.secondary">
              Table #{order.table?.tableNumber || "N/A"}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body1" fontWeight="medium">
            {order.items.length} items
          </Typography>
          <Typography variant="body2" color="text.secondary">
            •
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            ₹{order.totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && orders.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const pendingOrders = groupOrdersByStatus("pending");
  const preparingOrders = groupOrdersByStatus("preparing");
  const servedOrders = groupOrdersByStatus("served");
  const completedOrders = groupOrdersByStatus("completed");

  return (
    <Box sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          mb: 3,
          padding: isSmall ? "0 8px" : "0 16px",
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          fontSize={isMobile ? "1.5rem" : "2rem"}
        >
          Order Status Board
        </Typography>
        <Button
          variant="contained"
          size={isSmall ? "small" : "medium"}
          sx={{ backgroundColor:"#F57400", '&:hover': { backgroundColor: "#FF8753" } }}
        >
          <AssignmentIcon /> &nbsp; Manage Orders
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: isSmall ? 1 : 2,
          padding: isSmall ? "0 8px" : "0 16px",
        }}
      >
        {/* Pending Orders */}
        <Paper
          variant="outlined"
          sx={{
            p: isSmall ? 1 : 2,
            backgroundColor: "#fff8f0",
            height: "90%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#ed6c02",
                mr: 1,
              }}
            />
            <Typography variant="h6" color="#b54708">
              Pending
            </Typography>
            <Chip
              label={pendingOrders.length}
              size="small"
              color="warning"
              sx={{ ml: "auto" }}
            />
          </Box>

          {pendingOrders.length > 0 ? (
            <Box
              sx={{
                overflowY: "auto",
                maxHeight: "calc(100vh - 200px)",
                pr: 0.5,
              }}
            >
              {pendingOrders.map(renderOrderCard)}
            </Box>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: "center",
                color: "text.secondary",
                borderStyle: "dashed",
              }}
            >
              <Typography>No pending orders</Typography>
            </Paper>
          )}
        </Paper>

        {/* Preparing Orders */}
        <Paper
          variant="outlined"
          sx={{
            p: isSmall ? 1 : 2,
            backgroundColor: "#f0f7ff",
            height: "90%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#0288d1",
                mr: 1,
              }}
            />
            <Typography variant="h6" color="#0a4b78">
              Preparing
            </Typography>
            <Chip
              label={preparingOrders.length}
              size="small"
              color="info"
              sx={{ ml: "auto" }}
            />
          </Box>

          {preparingOrders.length > 0 ? (
            <Box
              sx={{
                overflowY: "auto",
                maxHeight: "calc(100vh - 200px)",
                pr: 0.5,
              }}
            >
              {preparingOrders.map(renderOrderCard)}
            </Box>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: "center",
                color: "text.secondary",
                borderStyle: "dashed",
              }}
            >
              <Typography>No orders in preparation</Typography>
            </Paper>
          )}
        </Paper>

        {/* Served Orders */}
        <Paper
          variant="outlined"
          sx={{
            p: isSmall ? 1 : 2,
            backgroundColor: "#fff0f7",
            height: "90%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#d81b60",
                mr: 1,
              }}
            />
            <Typography variant="h6" color="#9a1146">
              Served
            </Typography>
            <Chip
              label={servedOrders.length}
              size="small"
              color="secondary"
              sx={{ ml: "auto" }}
            />
          </Box>

          {servedOrders.length > 0 ? (
            <Box
              sx={{
                overflowY: "auto",
                maxHeight: "calc(100vh - 200px)",
                pr: 0.5,
              }}
            >
              {servedOrders.map(renderOrderCard)}
            </Box>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: "center",
                color: "text.secondary",
                borderStyle: "dashed",
              }}
            >
              <Typography>No served orders</Typography>
            </Paper>
          )}
        </Paper>

        {/* Completed Orders */}
        <Paper
          variant="outlined"
          sx={{
            p: isSmall ? 1 : 2,
            backgroundColor: "#f0fdf4",
            height: "90%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#2e7d32",
                mr: 1,
              }}
            />
            <Typography variant="h6" color="#166534">
              Completed
            </Typography>
            <Chip
              label={completedOrders.length}
              size="small"
              color="success"
              sx={{ ml: "auto" }}
            />
          </Box>

          {completedOrders.length > 0 ? (
            <Box
              sx={{
                overflowY: "auto",
                maxHeight: "calc(100vh - 200px)",
                pr: 0.5,
              }}
            >
              {completedOrders.map(renderOrderCard)}
            </Box>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: "center",
                color: "text.secondary",
                borderStyle: "dashed",
              }}
            >
              <Typography>No completed orders</Typography>
            </Paper>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardOrders;
