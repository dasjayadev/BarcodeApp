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
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import TuneIcon from "@mui/icons-material/Tune";
import { getMenuItems,} from "../../services/api"; // Adjust the import path as needed
import { Navigate } from "react-router-dom";
import { CircleDashed, LeafyGreen, Vegan, WheatOff } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const DashboardMenu = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  console.log(menu)
  return (
    <Box
      sx={{
        padding: "0 16px",
      }}
    >
      {/* Section Title */}
      <Typography variant="h4" fontWeight="bold" mb={2} fontSize={isMobile ? "1.5rem" : "2rem"}>
      
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
        <Grid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <Box>
              <CircleDashed size={40} className="animate animate-spin text-orange-500" />
            </Box>
          ) : error ? (
          <Box>{error}</Box>
          ) : (
          <>
            {menu.slice(0,8).map((item) => (
            <Grid
              
              key={item.id}
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

                <Tooltip sx={{
                  color: "textSecondary",
                }}
                  title={item.description} arrow
                >
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
                </Tooltip>

                
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                    <Typography variant="body2" noWrap 
                    sx={{
                       textAlign: "center",
                       bgcolor: "#F5740099",
                       width: "fit-content",
                       padding: "2px 4px",
                       color: "#fff",
                       borderRadius: "5px",
                      }}
                    >
                      {item?.categoryName}
                    </Typography>
                    </Box>

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
                        color="#009966"
                        sx={{ 
                          mr: 1,
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.8rem",
                          gap: 0.5,
                         }}
                      >
                        <Vegan size={15}/>
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
                          gap: 0.5,
                         }}
                      >
                        <WheatOff size={15}/>
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
          </>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardMenu;
