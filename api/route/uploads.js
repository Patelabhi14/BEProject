//initial import
const path = require('path');
const express = require('express');
const multer = require('multer');

//import product Schema and middlewares
const checkAuth = require('../middleware/Auth/check-auth');

//creating routes for /api/products
const router = express.Router();

//body parsing using multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './uploads/');
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 5 },
});

router.post('/', checkAuth, upload.single('image'), (req, res, next) => {
	const imageUrl =
		req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename;
	res.status(201).json({ imageUrl: imageUrl });
});

//module export
module.exports = router;
