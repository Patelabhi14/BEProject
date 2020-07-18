//intial export
const express = require('express');

//importing order, product and user Schema and middlewares
const Order = require('../model/order');
const User = require('../model/user');
const checkAuth = require('../middleware/Auth/check-auth');

//creating routes for /api/orders
const router = express.Router();

//get request for all requests
router.get('/', checkAuth, (req, res, next) => {
	Order.find({ userId: { $ne: req.user.id } })
		.populate('product')
		.exec()
		.then((orders) => {
			if (!orders)
				res.status(404).json({ error: { message: 'Page Not Found.' } });
			let requests = [];
			orders.forEach((order) => {
				if (
					order.product.userId == req.user.id &&
					!requests.includes(order.product)
				)
					requests.push(order.product);
			});
			res.status(200).json(requests);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//get request for requests to specific product
router.get('/:productId', checkAuth, (req, res, next) => {
	Order.find({ userId: { $ne: req.user.id } })
		.populate('product')
		.exec()
		.then((orders) => {
			if (!orders)
				res.status(404).json({ error: { message: 'Page Not Found.' } });
			let requests = orders.filter(
				(order) => order.product.userId == req.user.id
			);
			return getUser(req.params.productId, requests);
		})
		.then((results) => {
			res.status(200).json(results);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

getUser = async (productId, requests) => {
	let results = [];
	for (index in requests) {
		if (requests[index].product._id == productId) {
			let userData = await User.findOne({
				_id: requests[index].userId,
			}).select('name userName');
			results.push({
				name: userData.name,
				userName: userData.userName,
				requestedUserName:
					requests[index].firstName + ' ' + requests[index].lastName,
				requestedUserMobileNumber: requests[index].mobileNumber,
			});
		}
	}
	return results;
};

//module export
module.exports = router;
