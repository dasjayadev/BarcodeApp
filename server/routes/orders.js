const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table');
const { auth, authorize } = require('../middleware/auth');

// Get all orders (protected)
router.get('/', auth, async (req, res) => {
  try {
    const { status, table } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (table) query.table = table;
    
    const orders = await Order.find(query)
      .populate('table')
      .populate('items.menuItem')
      .populate('servedBy')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single order by ID (protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table')
      .populate('items.menuItem')
      .populate('servedBy');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create new order (public - anyone can order from a table)
router.post('/', async (req, res) => {
  try {
    const { tableId, items, customerName, customerEmail, notes } = req.body;
    
    // Validate input
    if (!tableId || !items || !items.length) {
      return res.status(400).json({ message: 'Table ID and at least one item are required' });
    }
    
    // Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += (item.price * item.quantity);
    });
    
    const newOrder = new Order({
      table: tableId,
      customer: {
        name: customerName || 'Guest',
        email: customerEmail
      },
      items,
      totalAmount,
      notes,
      status: 'pending',
      paymentStatus: 'unpaid'
    });
    
    const savedOrder = await newOrder.save();
    
    // Populate references for response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('table')
      .populate('items.menuItem');
      
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update order status (protected - staff, manager, owner)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'served', 'completed', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status
    order.status = status;
    
    // If status is "served" or "completed", assign staff member who served it
    if (['served', 'completed'].includes(status)) {
      order.servedBy = req.user._id;
    }
    
    await order.save();
    
    const updatedOrder = await Order.findById(req.params.id)
      .populate('table')
      .populate('items.menuItem')
      .populate('servedBy');
      
    res.json(updatedOrder);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update payment status (protected - staff, manager, owner)
router.put('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!paymentStatus || !['unpaid', 'paid'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Valid payment status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.paymentStatus = paymentStatus;
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
