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

import { getQRCodes, getQRCode, createQRCode } from "../../services/api";

const API_BASE_URL = "http://localhost:5000"; // Adjust based on your setup

const DashboardTable = () => {
  const [tables, setTables] = useState([
    { id: 1, name: "Table #1", status: "Active", seats: 4 },
    { id: 2, name: "Table #2", status: "Active", seats: 6 },
    { id: 3, name: "Table #3", status: "Inactive", seats: 2 },
  ]);
  
  const [restaurantQR, setRestaurantQR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGlobalQRCode();
  }, []);

  const fetchGlobalQRCode = async () => {
    try {
      setLoading(true);
      // Fetch QR codes with type 'global'
      const response = await getQRCodes({ type: 'global' });
      
      // Find the Restaurant/Global Menu QR Code
      const globalMenuQR = response.data.find(qr => 
        qr.section === 'Global Menu' || qr.section === 'Restaurant QR Code'
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
    const printWindow = window.open('', '_blank');
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

  const handleGenerateTableQR = async (tableId, tableName) => {
    try {
      // In a real implementation, you'd call an API to generate a QR code for this table
      // For now, let's use an alert to show the intent
      alert(`QR code would be generated for ${tableName}`);
      
      // This would be the actual implementation:
      // await createQRCode({
      //   tableId: tableId,
      //   baseUrl: window.location.origin // Frontend URL for generating menu links
      // });
      
      // Then you might refresh the table data to show the new QR code
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  };

  return (
    <Box display="flex" gap={3} p={3}>
      {/* QR Code Section */}
      <Card sx={{ flex: 1, textAlign: "center", p: 3 }}>
        <Box
          sx={{
            backgroundColor: "#f9f9f9",
            borderRadius: 2,
            p: 5,
            mb: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : restaurantQR ? (
            <img 
              src={`${API_BASE_URL}${restaurantQR.code}`}
              alt="Restaurant QR Code"
              style={{ maxWidth: "100%", maxHeight: 200 }}
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
        <Typography variant="h6">Restaurant QR Code</Typography>
        {restaurantQR && (
          <Typography variant="body2" color="textSecondary" mt={1} mb={2}>
            Scan to access the restaurant menu
          </Typography>
        )}
        <Box display="flex" justifyContent="center" gap={2} mt={2}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />}
            disabled={!restaurantQR}
            component="a"
            href={restaurantQR ? `${API_BASE_URL}${restaurantQR.code}` : "#"}
            download={restaurantQR ? `restaurant-qr-code.png` : ""}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={!restaurantQR}
          >
            Print
          </Button>
        </Box>
      </Card>

      {/* Tables Section */}
      <Box flex={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6">All Tables</Typography>
          <Button variant="contained" color="primary">
            + Add Table
          </Button>
        </Box>
        <Grid container spacing={3}>
          {tables.map((table) => (
            <Grid item xs={12} sm={6} md={4} key={table.id}>
              <Card
                sx={{
                  textAlign: "center",
                  backgroundColor:
                    table.status === "Inactive" ? "#f9f9f9" : "#fff",
                }}
              >
                <CardContent>
                  <Typography variant="h6">
                    {table.name}{" "}
                    <Typography
                      component="span"
                      sx={{
                        color: table.status === "Active" ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {table.status}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {table.seats} Seats
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PhoneAndroidIcon />}
                    onClick={() => handleGenerateTableQR(table.id, table.name)}
                  >
                    Generate QR
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardTable;