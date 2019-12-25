//importing user Schema
const User = require('../../model/user');

//exporting remove product function
module.exports = (req, res, next) => {
	User.findOneAndUpdate(
		{ _id: req.user.id, products: req.params.productId },
		{ $pull: { products: req.params.productId } }
	)
		.exec()
		.then(updatedUser => {
			if (updatedUser) {
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
