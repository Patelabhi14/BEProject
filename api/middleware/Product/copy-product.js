const User = require('../../model/user');

module.exports = (userData, req, res, next) => {
	User.findById(userData.id)
		.exec()
		.then(availableUser => {
			return User.updateOne(
				{ _id: availableUser._id },
				{ $push: { products: userData.createdProductId } }
			).exec();
		})
		.then(updatedUser => {
			res.status(200).json(updatedUser);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
};
