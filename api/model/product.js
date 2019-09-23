const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	title: { type: String, required: true },
	price: { type: Number, required: true },
	description: { type: String, default: '' },
	category: { type: String, required: true },
	isBooked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', productSchema);
