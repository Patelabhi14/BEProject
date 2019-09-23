const express = require('express');
const Order = require('../model/order');
const Product = require('../model/product');

const router = express.Router();

router.get('/', (req, res, next) => {
	Order.find()
		.populate('product')
		.exec()
		.then(orders => {
			res.status(200).json(orders);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});
router.post('/', (req, res, next) => {
	const productId = req.body.product;
	Product.findById(productId)
		.exec()
		.then(product => {
			if (product) {
				const order = new Order({
					product: productId
				});
				return order.save();
			}
			res.status(404).json({
				error: {
					message: 'Page Not Found'
				}
			});
		})
		.then(order => {
			res.status(201).json(order);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});
router.get('/:orderId', (req, res, next) => {
	const id = req.params.orderId;
	Order.findById(id)
		.populate('product')
		.exec()
		.then(order => {
			if (order) {
				res.status(200).json(order);
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
router.delete('/:orderId', (req, res, next) => {
	const id = req.params.orderId;
	Order.findById(id)
		.exec()
		.then(order => {
			if (order) {
				return Order.remove({ _id: id }).exec();
			}
			res.status(404).json({
				error: {
					message: 'Page Not Found'
				}
			});
		})
		.then(deletedOrder => {
			res.status(200).json(deletedOrder);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

module.exports = router;
