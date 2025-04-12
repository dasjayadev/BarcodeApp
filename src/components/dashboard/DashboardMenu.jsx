import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import TuneIcon from "@mui/icons-material/Tune";
import { getMenuItems } from "../../services/api"; // Adjust the import path as needed
import { Navigate } from "react-router-dom";
import { LeafyGreen } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const DashboardMenu = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getMenuItems();
      setMenu(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load menu items. Please try again later."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch menu items from the server or API
    fetchMenuItems();
  }, []);

  const handleNavigate = () => {
    Navigate("/add-items");
  };

  // const handleInputChange = (id, field, value) => {
  //   setMenuItems((prevItems) =>
  //     prevItems.map((item) =>
  //       item.id === id ? { ...item, [field]: value } : item
  //     )
  //   );
  // };

  // const handleAddItem = () => {
  //   const newItem = {
  //     id: menuItems.length + 1,
  //     name: "New Item",
  //     description: "Description of the new item",
  //     price: "$0",
  //     isVeg: false,
  //     isVegan: false,
  //     image: "https://via.placeholder.com/150",
  //     isEditing: true,
  //   };
  //   setMenuItems((prevItems) => [...prevItems, newItem]);
  // };

  // const handleDeleteItem = (id) => {
  //   setMenuItems((prevItems) => prevItems.filter((item) => item.id !== id));
  // };

  return (
    <Box
      sx={{
        padding: "0 16px",
      }}
    >
      {/* Section Title */}
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Menu Items
      </Typography>

      {/* Menu Items Section */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            padding: " 0 5px",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Available Items
          </Typography>
          <Button
            variant="contained"
            startIcon={<TuneIcon />}
            onClick={handleNavigate}
            sx={{
              backgroundColor: "#F57400",
              "&:hover": {
                backgroundColor: "#FF8753",
              },
            }}
          >
            Add Items
          </Button>
        </Box>

        {/* Menu Items Grid */}
        <Grid container spacing={2}>
          {menu.map((item) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={item.id}
              // sx={{
              //   size: { xs: 12, sm: 6, md: 4 },
              // }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: "center",
                }}
              >
                <Box>
                  <img
                    src={
                      item.image.startsWith("/")
                        ? `http://localhost:5000${item.image}`
                        : item.image
                    }
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </Box>

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    marginTop: "1",
                    textTransform: "capitalize",
                  }}
                >
                  {item.name}
                </Typography>

                <Typography sx={{ color: "textSecondary" }}>
                  {item.description}
                </Typography>

                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  mt={1}
                >
                  <>
                    {item.dietaryInfo?.isVegetarian && (
                      <Typography
                        variant="caption"
                        color="green"
                        sx={{ 
                          mr: 1,
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.8rem",
                          gap: 0.5,
                          
                         }}
                      >
                        <LeafyGreen size={15}/>
                        Vegetarian
                      </Typography>
                    )}
                    {item.dietaryInfo?.isVegan && (
                      <Typography
                        variant="caption"
                        color="orange"
                        sx={{ 
                          mr: 1,
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.8rem",
                          
                         }}
                      >
                        Vegan
                      </Typography>
                    )}
                    {item.dietaryInfo?.isGlutenFree && (
                      <Typography
                        variant="caption"
                        color="orange"
                        sx={{ 
                          mr: 1,
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.8rem",

                         }}
                      >
                        <WheatOff/>
                        Gluten Free
                      </Typography>
                    )}
                  </>
                </Box>

                <Typography variant="body1" fontWeight="bold" mt={1}>
                  ₹{item.price}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardMenu;
