//import user Schema
const User = require('../../model/user');

//export copy product function
module.exports = (userData, req, res, next) => {
	User.findOneAndUpdate(
		{ _id: userData.id },
		{ $push: { products: userData.createdProductId } },
		{ new: true }
	)
		.select('products')
		.populate({ path: 'products' })
		.exec()
		.then(updatedUser => {
			res.status(200).json(updatedUser);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
};
