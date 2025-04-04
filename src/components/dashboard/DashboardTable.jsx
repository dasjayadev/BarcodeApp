import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";

import { getQRCodes, getTables, generateTableQR } from "../../services/api";

const API_BASE_URL = "http://localhost:5000"; // Adjust based on your setup

const DashboardTable = () => {
  const [tables, setTables] = useState([]);

  const [restaurantQR, setRestaurantQR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await getTables();
      setTables(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch tables:", err);
      setError(err.response?.data?.message || "Failed to load tables");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalQRCode();
    fetchTables();
  }, []);

  const fetchGlobalQRCode = async () => {
    try {
      setLoading(true);
      // Fetch QR codes with type 'global'
      const response = await getQRCodes({ type: "global" });

      // Find the Restaurant/Global Menu QR Code
      const globalMenuQR = response.data.find(
        (qr) =>
          qr.section === "Global Menu" || qr.section === "Restaurant QR Code"
      );

      if (globalMenuQR) {
        setRestaurantQR(globalMenuQR);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching QR code:", err);
      setError("Failed to load QR code");
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!restaurantQR) return;

    // Create a new window with just the QR code image
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 300px; }
            .container { text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${restaurantQR.section}</h2>
            <img src="${API_BASE_URL}${restaurantQR.code}" />
            <p>Scan to access the menu</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    // Use setTimeout to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleGenerateTableQR = async (tableId, tableNumber) => {
    try {
      setLoading(true);
      // Get the base URL from the browser
      const baseUrl = window.location.origin;
      await generateTableQR(tableId, baseUrl);
      setLoading(false);

      // Refresh tables to show the newly generated QR code
      fetchTables();
    } catch (err) {
      console.error("Failed to generate QR code:", err);
      setError("Failed to generate QR code. Please try again.");
      setLoading(false);
    }
  };

  // Add this function for printing individual table QR codes
  const handlePrintTableQR = (table) => {
    if (!table.qrCode) return;

    // Create a new window with just the QR code image
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table QR Code</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 300px; }
            .container { text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Table ${table.tableNumber}</h2>
            <img src="${API_BASE_URL}${table.qrCode.code}" />
            <p>Scan to access the menu</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    // Use setTimeout to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Box display='flex' gap={3} p={3}>
      {/* QR Code Section */}
      <Card sx={{ flex: 1, textAlign: "center", p: 3, borderRadius: 2 }}>
        <Box
          sx={{
            backgroundColor: "#f9f9f9",
            borderRadius: 2,
            // p: 5,
            mb: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
            height: 300,
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity='error'>{error}</Alert>
          ) : restaurantQR ? (
            <img
              src={`${API_BASE_URL}${restaurantQR.code}`}
              alt='Restaurant QR Code'
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            <Box
              sx={{
                width: 80,
                height: 80,
                backgroundColor: "#e0e0e0",
                margin: "0 auto",
                borderRadius: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              No QR
            </Box>
          )}
        </Box>
        <Typography variant='h6'>Restaurant QR Code</Typography>
        {restaurantQR && (
          <Typography variant='body2' color='textSecondary' mt={1} mb={2}>
            Scan to access the restaurant menu
          </Typography>
        )}
        <Box display='flex' justifyContent='center' gap={2} mt={2}>
          <Button
            variant='contained'
            color='primary'
            startIcon={<DownloadIcon />}
            disabled={!restaurantQR}
            component='a'
            href={restaurantQR ? `${API_BASE_URL}${restaurantQR.code}` : "#"}
            download={restaurantQR ? `restaurant-qr-code.png` : ""}
            target='_blank'
            rel='noopener noreferrer'
          >
            Download
          </Button>
          <Button
            variant='outlined'
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={!restaurantQR}
          >
            Print
          </Button>
        </Box>
      </Card>

      {/* Tables Section */}
      <Box
        flex={2}
        sx={{ borderRadius: 2, p: 3, backgroundColor: "#fff", boxShadow: 1 }}
      >
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={3}
        >
          <Typography variant='h6'>All Tables</Typography>
          <Button variant='contained' color='primary'>
            + Add Table
          </Button>
        </Box>
        <Grid container spacing={3}>
          {tables.slice(0, 4).map((table) => (
            <Grid item xs={12} sm={6} md={4} key={table._id}>
              <Card
                sx={{
                  textAlign: "center",
                  backgroundColor: table.isActive
                    ? "#ffffff"
                    : "oklch(97.1% 0.013 17.38)",
                  borderRadius: 1,
                  boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)",
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.4)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mb: 2,
                      height: 50, // Fixed height for consistent layout
                    }}
                    className='table-icon'
                  >
                    {table.qrCode ? (
                      <img
                        src={`${API_BASE_URL}${table.qrCode.code}`}
                        alt={`QR Code for Table ${table.tableNumber}`}
                        style={{ maxWidth: "100%", maxHeight: 80 }}
                        fit='cover'
                      />
                    ) : (
                      <img
                        src={`${API_BASE_URL}/images/table-icon.png`}
                        alt='Table Icon'
                        style={{ width: 50, height: 50 }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant='h6'
                    sx={{ fontSize: "1rem", fontWeight: "600" }}
                  >
                    Table #{table.tableNumber}{" "}
                    <Typography
                      component='span'
                      sx={{
                        color: table.isActive
                          ? "oklch(44.8% 0.119 151.328)"
                          : "oklch(44.4% 0.177 26.899)",
                        backgroundColor: table.isActive
                          ? "oklch(96.2% 0.044 156.743)"
                          : "oklch(93.6% 0.032 17.717)",
                        fontWeight: "600",
                        padding: "2px 5px",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {table.isActive ? "Active" : "Inactive"}
                    </Typography>
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    {table.capacity} Seats
                  </Typography>
                </CardContent>
                <CardActions>
                  {table.qrCode ? (
                    // For tables with QR codes, show download and print buttons
                    <Box
                      display='flex'
                      justifyContent='center'
                      gap={2}
                      width='100%'
                    >
                      <Button
                        variant='contained'
                        color='primary'
                        component='a'
                        href={`${API_BASE_URL}${table.qrCode.code}`}
                        download={`table-${table.tableNumber}-qr-code.png`}
                        target='_blank'
                        rel='noopener noreferrer'
                        size='small'
                        sx={{ flex: 1 }}
                      >
                        <DownloadIcon />
                      </Button>
                      <Button
                        variant='outlined'
                        onClick={() => handlePrintTableQR(table)}
                        size='small'
                        sx={{ flex: 1 }}
                      >
                        <PrintIcon />
                      </Button>
                    </Box>
                  ) : (
                    // For tables without QR codes, show generate button
                    <Button
                      variant='outlined'
                      fullWidth
                      startIcon={<PhoneAndroidIcon />}
                      onClick={() =>
                        handleGenerateTableQR(table._id, table.tableNumber)
                      }
                    >
                      Generate QR
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}

          {tables.length > 4 && (
            <Grid item xs={12} sx={{ mt: 2, textAlign: "center" }}>
              <Button variant='outlined' color='primary'>
                View All Tables ({tables.length})
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardTable;
