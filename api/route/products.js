//initial import
const express = require('express');
const multer = require('multer');

//import product Schema and middlewares
const Product = require('../model/product');
const User = require('../model/user');
const checkAuth = require('../middleware/Auth/check-auth');
const copyProduct = require('../middleware/Product/copy-product');
const removeProduct = require('../middleware/Product/remove-product');

//creating routes for /api/products
const router = express.Router();

//body parsing using multer
const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './uploads/');
	},
	filename: function(req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	}
});
const upload = multer({ storage: storage });

//get request for all products
router.get('/', (req, res, next) => {
	let isBooked = {};
	let category = {};

	if (req.query.isBooked === 'true') isBooked = true;
	else isBooked = false;

	if (req.query.category === 'Electronics') category = 'Electronics';
	else if (req.query.category === 'Places') category = 'Places';
	else if (req.query.category === 'Automobile') category = 'Automobile';
	else category = 'Places';

	Product.find({ isBooked: isBooked, category: category }, null, {
		limit: parseInt(req.query.limit),
		skip: parseInt(req.query.skip)
	})
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
	upload.single('productImage'),
	(req, res, next) => {
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
				req.user.createdProductId = createdProduct._id;
				next();
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
router.patch('/:productId', checkAuth, (req, res, next) => {
	const id = req.params.productId;
	User.findOne({ _id: req.user.id, products: id })
		.exec()
		.then(product => {
			if (!product)
				return res.status(404).json({
					error: {
						message: 'Page Not Found'
					}
				});
			const updateOps = {};
			for (const ops of req.body) {
				updateOps[ops.propName] = ops.value;
			}
			Product.findByIdAndUpdate(id, { $set: updateOps }, { new: true })
				.exec()
				.then(updatedProduct => {
					if (updatedProduct) {
						res.status(200).json(updatedProduct);
					} else {
						res.status(404).json({
							error: {
								message: 'Page Not Found'
							}
						});
					}
				})
				.catch(err => {
					throw new Error(err);
				});
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});
//delete request for deleting specific productId
router.delete('/:productId', checkAuth, removeProduct, (req, res, next) => {
	Product.findByIdAndRemove(req.params.productId)
		.exec()
		.then(deletedProduct => {
			if (deletedProduct) {
				res.status(200).json(deletedProduct);
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

//module export
module.exports = router;
