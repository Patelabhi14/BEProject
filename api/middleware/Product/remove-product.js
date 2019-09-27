const User = require('../../model/user');

module.exports = (userData, req, res, next) => {
	User.findOneAndUpdate({ _id: userData.id }, { $pull: { products: req.params.productId } })
		.exec()
		.then(() => {
			next(req.params.productId);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
};
