import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Grid, TextField, IconButton, Switch, FormControlLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const DashboardMenu = () => {
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Item Name', description: 'Description of the item', price: '$10', isVeg: true, isVegan: false, image: 'https://via.placeholder.com/150', isEditing: false },
    { id: 2, name: 'Another Item', description: 'Description of the item', price: '$15', isVeg: false, isVegan: true, image: 'https://via.placeholder.com/150', isEditing: false },
  ]);

  const handleEditToggle = (id) => {
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isEditing: !item.isEditing } : item
      )
    );
  };

  const handleInputChange = (id, field, value) => {
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddItem = () => {
    const newItem = {
      id: menuItems.length + 1,
      name: 'New Item',
      description: 'Description of the new item',
      price: '$0',
      isVeg: false,
      isVegan: false,
      image: 'https://via.placeholder.com/150',
      isEditing: true,
    };
    setMenuItems((prevItems) => [...prevItems, newItem]);
  };

  const handleDeleteItem = (id) => {
    setMenuItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <Box p={4}>
      {/* Section Title */}
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Menu Items
      </Typography>

      {/* Menu Items Section */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Available Items
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{
              backgroundColor: '#F57400',
              '&:hover': {
                backgroundColor: '#FF8753',
              },
            }}
          >
            Add Items
          </Button>
        </Box>

        {/* Menu Items Grid */}
        <Grid container spacing={2}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                {item.isEditing ? (
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={item.image}
                    onChange={(e) => handleInputChange(item.id, 'image', e.target.value)}
                    label="Image URL"
                    sx={{ mb: 2 }}
                  />
                ) : (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                )}
                {item.isEditing ? (
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={item.name}
                    onChange={(e) => handleInputChange(item.id, 'name', e.target.value)}
                    label="Item Name"
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant="subtitle1" fontWeight="bold" mt={1}>
                    {item.name}
                  </Typography>
                )}
                {item.isEditing ? (
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={item.description}
                    onChange={(e) => handleInputChange(item.id, 'description', e.target.value)}
                    label="Description"
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography color="textSecondary">{item.description}</Typography>
                )}
                <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
                  {item.isEditing ? (
                    <>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={item.isVeg}
                            onChange={(e) => handleInputChange(item.id, 'isVeg', e.target.checked)}
                          />
                        }
                        label="Vegetarian"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={item.isVegan}
                            onChange={(e) => handleInputChange(item.id, 'isVegan', e.target.checked)}
                          />
                        }
                        label="Vegan"
                      />
                    </>
                  ) : (
                    <>
                      {item.isVeg && (
                        <Typography
                          variant="caption"
                          color="green"
                          sx={{ mr: 1 }}
                        >
                          🥦 Vegetarian
                        </Typography>
                      )}
                      {item.isVegan && (
                        <Typography
                          variant="caption"
                          color="orange"
                          sx={{ mr: 1 }}
                        >
                          🌱 Vegan
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
                {item.isEditing ? (
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={item.price}
                    onChange={(e) => handleInputChange(item.id, 'price', e.target.value)}
                    label="Price"
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant="body1" fontWeight="bold" mt={1}>
                    {item.price}
                  </Typography>
                )}
                <Box mt={2} display="flex" justifyContent="center" gap={1}>
                  {item.isEditing ? (
                    <>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditToggle(item.id)}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleEditToggle(item.id)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        sx={{ color: 'green' }}
                        onClick={() => handleEditToggle(item.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        sx={{ color: 'red' }}
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardMenu;