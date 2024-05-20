const express = require('express');
const { contactUs } = require('../controllers/contactController.js');
const router = express.Router();
const protect = require('../middleWare/authMiddleware.js');

router.post("/", protect, contactUs);

module.exports = router;