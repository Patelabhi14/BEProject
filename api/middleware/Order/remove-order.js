//importing user Schema
const User = require('../../model/user');

//exporting remove order function
module.exports = (userData, req, res, next) => {
	User.findOneAndUpdate(
		{ _id: userData.id },
		{ $pull: { orders: req.params.orderId } },
		{ new: true }
	)
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
