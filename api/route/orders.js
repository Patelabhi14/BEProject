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
router.get('/', checkAuth, (userData, req, res, next) => {
	User.findById(userData.id)
		.select('orders')
		.populate({ path: 'orders', populate: { path: 'product' } })
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
	(userData, req, res, next) => {
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
				userData.createdOrderId = createdOrder._id;
				next(userData);
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
router.get('/:orderId', checkAuth, (userData, req, res, next) => {
	User.findById(userData.id)
		.select('orders')
		.populate({ path: 'orders', populate: { path: 'product' } })
		.exec()
		.then(user => {
			if (user) {
				res.status(200).json(result);
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
//delete specific order for specific userId
router.delete('/:orderId', checkAuth, removeOrder, (id, req, res, next) => {
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

//module export
module.exports = router;
