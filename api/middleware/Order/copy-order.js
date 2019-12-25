//import user Schema
const User = require('../../model/user');

//export copy order function
module.exports = (req, res, next) => {
	User.findOneAndUpdate(
		{ _id: req.user.id },
		{ $push: { orders: req.user.createdOrderId } },
		{ new: true }
	)
		.select('orders')
		.populate({ path: 'orders', populate: { path: 'product' } })
		.exec()
		.then(updatedOrder => {
			const order = updatedOrder.orders.find(
				o => String(o._id) == String(req.user.createdOrderId)
			);
			res.status(200).json(order);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
};
