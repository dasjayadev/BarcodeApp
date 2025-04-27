const MenuItem = require('../models/MenuItem.model');
const Table = require('../models/Table.model');
const Category = require('../models/Category.model');
const Order = require('../models/Order.model');

// Get all menu items (public access)
exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ isActive: true });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific menu item (public access)
exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get menu categories (public access)
exports.getMenuCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get table information (public access)
exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get menu for specific table (public access)
exports.getTableMenu = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Get the menu items relevant to this table
    const menuItems = await MenuItem.find({ isActive: true });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public endpoint to create an order
exports.createOrder = async (req, res) => {
  try {
    const { table, items, totalPrice } = req.body;

    // Validate table
    const tableRecord = await Table.findById(table);
    if (!tableRecord) {
      return res.status(400).json({ message: 'Invalid table' });
    }

    const newOrder = new Order({
      table,
      items,
      totalPrice,
      status: 'pending', // Default status
      paymentStatus: 'unpaid' // Default payment status
    });

    const order = await newOrder.save();
    res.status(201).json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};