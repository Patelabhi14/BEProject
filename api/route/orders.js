//intial export
const express = require('express');

//importing order, product and user Schema and middlewares
const Order = require('../model/order');
const Product = require('../model/product');
const User = require('../model/user');
const checkAuth = require('../middleware/Auth/check-auth');
const copyOrder = require('../middleware/Order/copy-order');
const removeOrder = require('../middleware/Order/remove-order');

//creating routes for /api/orders
const router = express.Router();

//get all orders for specific userId
router.get('/', checkAuth, (req, res, next) => {
	User.findById(req.user.id)
		.select('orders')
		.populate({
			path: 'orders',
			populate: { path: 'product' },
			options: { limit: parseInt(req.query.limit), skip: parseInt(req.query.skip) }
		})
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
//creating new order for specific userId
router.post(
	'/',
	checkAuth,
	(req, res, next) => {
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
			.then(createdOrder => {
				req.user.createdOrderId = createdOrder._id;
				next();
			})
			.catch(err => {
				res.status(500).json({
					error: err
				});
			});
	},
	copyOrder
);
//get specific order for specific userId
router.get('/:orderId', checkAuth, (req, res, next) => {
	const id = req.params.orderId;
	User.findOne({ _id: req.user.id, orders: id })
		.select('orders')
		.populate({ path: 'orders', populate: { path: 'product' } })
		.exec()
		.then(orders => {
			if (orders) {
				const order = orders.orders.find(o => o._id == id);
				res.status(200).json(order);
			} else
				res.status(404).json({
					error: {
						message: 'Page Not Found'
					}
				});
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});
//delete specific order for specific userId
router.delete('/:orderId', checkAuth, removeOrder, (req, res, next) => {
	Order.findByIdAndRemove(req.params.orderId)
		.populate('product')
		.exec()
		.then(deletedOrder => {
			if (deletedOrder) {
				res.status(200).json(deletedOrder);
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
