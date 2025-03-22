const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1 });
    res.json(menuItems);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create menu item (protected)
router.post('/', auth, authorize('owner', 'manager'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const dietaryInfo = {
      isVegetarian: req.body.isVegetarian === 'true',
      isVegan: req.body.isVegan === 'true',
      isGlutenFree: req.body.isGlutenFree === 'true'
    };

    const newMenuItem = new MenuItem({
      name,
      description,
      price,
      category,
      dietaryInfo,
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });

    const menuItem = await newMenuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update menu item (protected)
router.put('/:id', auth, authorize('owner', 'manager'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const dietaryInfo = {
      isVegetarian: req.body.isVegetarian === 'true',
      isVegan: req.body.isVegan === 'true',
      isGlutenFree: req.body.isGlutenFree === 'true'
    };
    
    const menuItemFields = {
      name,
      description,
      price,
      category,
      dietaryInfo
    };
    
    if (req.file) {
      menuItemFields.image = `/uploads/${req.file.filename}`;
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: menuItemFields },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete menu item (protected)
router.delete('/:id', auth, authorize('owner', 'manager'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await menuItem.deleteOne();
    res.json({ message: 'Menu item removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;