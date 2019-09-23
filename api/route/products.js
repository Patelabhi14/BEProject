const express = require('express');
const Product = require('../model/product');

const router = express.Router();

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
router.post('/', (req, res, next) => {
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
			res.status(201).json(createdProduct);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});
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
router.patch('/:productId', (req, res, next) => {
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
router.delete('/:productId', (req, res, next) => {
	const id = req.params.productId;
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

module.exports = router;
