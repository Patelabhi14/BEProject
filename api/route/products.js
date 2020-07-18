//initial import
const express = require('express');
const multer = require('multer');

//import product Schema and middlewares
const Product = require('../model/product');
const checkAuth = require('../middleware/Auth/check-auth');

//creating routes for /api/products
const router = express.Router();

//get request for all products
router.get('/', checkAuth, (req, res, next) => {
	const userId = req.user.id;
	Product.find({ userId: { $ne: userId } }, null, {
		limit: parseInt(req.query.limit),
		skip: parseInt(req.query.skip),
	})
		.select('-__v')
		.exec()
		.then((products) => {
			res.status(200).json(products);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//get request for my products
router.get('/my', checkAuth, (req, res, next) => {
	const userId = req.user.id;
	Product.find({ userId: userId })
		.select('-__v')
		.exec()
		.then((products) => {
			res.status(200).json(products);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//get request for specific productId
router.get('/single/:productId', checkAuth, (req, res, next) => {
	const id = req.params.productId;
	Product.findById(id)
		.select('-__v')
		.exec()
		.then((product) => {
			if (product) {
				res.status(200).json(product);
			} else {
				res.status(404).json({
					error: {
						message: 'Page Not Found',
					},
				});
			}
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//post request for creating new product
router.post('/', checkAuth, (req, res, next) => {
	const product = new Product({
		title: req.body.title,
		price: req.body.price,
		description: req.body.description,
		category: req.body.category,
		isBooked: req.body.isBooked,
		userId: req.user.id,
		location: req.body.location,
		imageUrl: req.body.imageUrl,
	});
	product
		.save()
		.then((product) => {
			const createdProduct = {
				_id: product._id,
				category: product.category,
				title: product.title,
				description: product.description,
				price: product.price,
				userId: product.userId,
				isBooked: product.isBooked,
				location: product.location,
				imageUrl: req.body.imageUrl,
			};
			res.status(201).json(createdProduct);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//patch request for updating specific productId
router.patch('/:productId', checkAuth, (req, res, next) => {
	const id = req.params.productId;
	const updateOps = {};
	for (const ops of req.body) updateOps[ops.propName] = ops.value;
	Product.findOneAndUpdate(
		{ _id: id, userId: req.user.id },
		{ $set: updateOps },
		{ new: true }
	)
		.select('-__v')
		.exec()
		.then((updatedProduct) => {
			if (updatedProduct) {
				res.status(200).json(updatedProduct);
			} else {
				res.status(404).json({
					error: {
						message: 'Page Not Found',
					},
				});
			}
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//delete request for deleting specific productId
router.delete('/:productId', checkAuth, (req, res, next) => {
	const id = req.params.productId;
	Product.findOneAndRemove({ _id: id, userId: req.user.id })
		.select('-__v')
		.exec()
		.then((deletedProduct) => {
			if (deletedProduct) {
				res.status(200).json(deletedProduct);
			} else {
				res.status(404).json({
					error: {
						message: 'Page Not Found',
					},
				});
			}
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//module export
module.exports = router;
