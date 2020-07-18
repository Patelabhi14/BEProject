//intial export
const express = require('express');

//importing order, product and user Schema and middlewares
const Order = require('../model/order');
const Product = require('../model/product');
const checkAuth = require('../middleware/Auth/check-auth');

//creating routes for /api/orders
const router = express.Router();

//get all orders for specific userId
router.get('/', checkAuth, (req, res, next) => {
	const userId = req.user.id;
	Order.find({ userId: userId })
		.populate({
			path: 'product',
			options: {
				limit: parseInt(req.query.limit),
				skip: parseInt(req.query.skip),
			},
		})
		.exec()
		.then((orders) => {
			res.status(200).json(orders);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//get specific order for specific userId
router.get('/single/:orderId', checkAuth, (req, res, next) => {
	const id = req.params.orderId;
	Order.findOne({ _id: id, userId: req.user.id })
		.populate('product')
		.exec()
		.then((order) => {
			if (order) {
				res.status(200).json(order);
			} else
				res.status(404).json({
					error: {
						message: 'Page Not Found',
					},
				});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//creating new order for specific userId
router.post('/', checkAuth, (req, res, next) => {
	const productId = req.body.product;
	Product.findById(productId)
		.exec()
		.then((product) => {
			if (product) {
				const order = new Order({
					product: product._id,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					mobileNumber: req.body.mobileNumber,
					gender: req.body.gender,
					userId: req.user.id,
				});
				return order.save();
			}
			res.status(404).json({
				error: {
					message: 'Page Not Found',
				},
			});
		})
		.then((order) => {
			return order.populate('product').execPopulate();
		})
		.then((popOrder) => {
			const createdOrder = {
				id: popOrder._id,
				product: popOrder.product,
				firstName: popOrder.firstName,
				lastName: popOrder.lastName,
				mobileNumber: popOrder.mobileNumber,
				gender: popOrder.gender,
				userId: popOrder.userId,
			};
			res.status(201).json(createdOrder);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//delete specific order for specific userId
router.delete('/:orderId', (req, res, next) => {
	Order.findByIdAndRemove(req.params.orderId)
		.populate('product')
		.exec()
		.then((deletedOrder) => {
			if (deletedOrder) {
				res.status(200).json(deletedOrder);
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
