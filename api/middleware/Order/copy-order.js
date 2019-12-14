//import user Schema
const User = require('../../model/user');

//export copy order function
module.exports = (userData, req, res, next) => {
	User.findOneAndUpdate(
		{ _id: userData.id },
		{ $push: { orders: userData.createdOrderId } },
		{ new: true }
	)
		.select('orders')
		.populate({ path: 'orders' })
		.exec()
		.then(updatedOrder => {
			res.status(200).json(updatedOrder);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
};
