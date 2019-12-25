//import user Schema
const User = require('../../model/user');

//export copy product function
module.exports = (req, res, next) => {
	User.findOneAndUpdate(
		{ _id: req.user.id },
		{ $push: { products: req.user.createdProductId } },
		{ new: true }
	)
		.select('products')
		.populate({ path: 'products' })
		.exec()
		.then(updatedUser => {
			const product = updatedUser.products.find(
				p => String(p._id) == String(req.user.createdProductId)
			);
			res.status(200).json(product);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
};
