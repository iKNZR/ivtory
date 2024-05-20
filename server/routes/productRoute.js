const express = require('express');
const router = express.Router();
const protect = require('../middleWare/authMiddleware.js');
const {
    createProduct, 
    getProducts, 
    getProduct, 
    deleteProduct, 
    updateProduct
} = require('../controllers/productController.js');
const { upload } = require('../utils/fileUpload.js');

router.post("/", protect, upload.single("image"), createProduct);
router.patch("/:id", protect, upload.single("image"), updateProduct);
router.get("/", protect, getProducts);
router.get("/:id", protect, getProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;