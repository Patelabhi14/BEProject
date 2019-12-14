//initial import
const express = require('express');

//import product Schema and middlewares
const Product = require('../model/product');
const checkAuth = require('../middleware/Auth/check-auth');
const copyProduct = require('../middleware/Product/copy-product');
const removeProduct = require('../middleware/Product/remove-product');

//creating routes for /api/products
const router = express.Router();

//get request for all products
router.get('/', (req, res, next) => {
	Product.find()
		.exec()
		.then(products => {
			res.status(200).json(products);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});
//post request for creating new product
router.post(
	'/',
	checkAuth,
	(userData, req, res, next) => {
		const product = new Product({
			title: req.body.title,
			price: req.body.price,
			description: req.body.description,
			category: req.body.category,
			isBooked: req.body.isBooked
		});
		product
			.save()
			.then(createdProduct => {
				userData.createdProductId = createdProduct._id;
				next(userData);
			})
			.catch(err => {
				res.status(500).json({
					error: err
				});
			});
	},
	copyProduct
);
//get request for specific productId
router.get('/:productId', (req, res, next) => {
	const id = req.params.productId;
	Product.findById(id)
		.exec()
		.then(product => {
			if (product) {
				res.status(200).json(product);
			} else {
				res.status(404).json({
					error: {
						message: 'Page Not Found'
					}
				});
			}
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});
//patch request for updating specific productId
router.patch('/:productId', checkAuth, (userData, req, res, next) => {
	const id = req.params.productId;
	Product.findById(id)
		.exec()
		.then(product => {
			if (product) {
				const updateOps = {};
				for (const ops of req.body) {
					updateOps[ops.propName] = ops.value;
				}
				return Product.update({ _id: id }, { $set: updateOps }).exec();
			}
			res.status(404).json({
				error: {
					message: 'Page Not Found'
				}
			});
		})
		.then(updatedProduct => {
			res.status(200).json(updatedProduct);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});
//delete request for deleting specific productId
router.delete('/:productId', checkAuth, removeProduct, (id, req, res, next) => {
	Product.findById(id)
		.exec()
		.then(product => {
			if (product) {
				return Product.remove({ _id: id }).exec();
			} else {
				res.status(404).json({
					error: {
						message: 'Page Not Found'
					}
				});
			}
		})
		.then(deltedProduct => {
			res.status(200).json(deltedProduct);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

//module export
module.exports = router;
