const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');
const qrcode = require('qrcode');
const { auth, authorize } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Get all QR codes (protected)
router.get('/', auth, authorize('owner', 'manager'), async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    
    if (type) {
      query.type = type;
    }
    
    const qrCodes = await QRCode.find(query).populate('tableId');
    res.json(qrCodes);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get QR code by ID (protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id).populate('tableId');
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    res.json(qrCode);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create global QR code (protected)
router.post('/', auth, authorize('owner', 'manager'), async (req, res) => {
  try {
    const { section, url } = req.body;

    // Generate QR code
    const qrCodePath = path.join(__dirname, '..', 'uploads', `qr-${Date.now()}.png`);
    await qrcode.toFile(qrCodePath, url);
    
    const code = `/uploads/${path.basename(qrCodePath)}`;

    const newQRCode = new QRCode({
      section,
      url,
      code,
      type: 'global'
    });

    const savedQRCode = await newQRCode.save();
    res.status(201).json(savedQRCode);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create global menu QR code (protected)
router.post('/global-menu', auth, authorize('owner', 'manager'), async (req, res) => {
  try {
    const { baseUrl } = req.body; // Frontend base URL
    
    // Generate URL for global menu
    const url = `${baseUrl}/menu`;
    
    // Generate QR code
    const qrCodePath = path.join(__dirname, '..', 'uploads', `qr-global-${Date.now()}.png`);
    await qrcode.toFile(qrCodePath, url);
    
    const code = `/uploads/${path.basename(qrCodePath)}`;

    const newQRCode = new QRCode({
      section: 'Global Menu',
      url,
      code,
      type: 'global'
    });

    const savedQRCode = await newQRCode.save();
    res.status(201).json(savedQRCode);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete QR code (protected)
router.delete('/:id', auth, authorize('owner', 'manager'), async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    // Delete QR code image file
    const filePath = path.join(__dirname, '..', qrCode.code);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await qrCode.deleteOne();
    res.json({ message: 'QR code removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;