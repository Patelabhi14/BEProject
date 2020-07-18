//intial import
const mongoose = require('mongoose');

//creating Order Schema
const orderSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true
	},
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	mobileNumber: { type: Number, required: true },
	gender: { type: String, required: true },
	userId: { type: String, required: true }
});

//export model of Order
module.exports = mongoose.model('Order', orderSchema);
