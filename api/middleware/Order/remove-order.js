const User = require('../../model/user');

module.exports = (userData, req, res, next) => {
	User.findOneAndUpdate({ _id: userData.id }, { $pull: { orders: req.params.orderId } })
		.exec()
		.then(() => {
			next(req.params.orderId);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
};
