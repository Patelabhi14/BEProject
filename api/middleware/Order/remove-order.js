//importing user Schema
const User = require('../../model/user');

//exporting remove order function
module.exports = (req, res, next) => {
	User.findOneAndUpdate(
		{ _id: req.user.id, orders: req.params.orderId },
		{ $pull: { orders: req.params.orderId } }
	)
		.exec()
		.then(updatedOrder => {
			if (updatedOrder) {
				next();
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
};
