const User = require('../../model/user');

module.exports = (userData, req, res, next) => {
	User.findOneAndUpdate({ _id: userData.id }, { $push: { orders: userData.createdOrderId } })
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
