//intial import
const mongoose = require('mongoose');

//creating Product Schema
const productSchema = new mongoose.Schema({
	title: { type: String, required: true },
	price: { type: Number, required: true },
	description: { type: String, default: '' },
	category: { type: String, required: true, enum: ['Electronics', 'Places', 'Automobile'] },
	isBooked: { type: Boolean, default: false },
	productImage: { type: Buffer }
});

//export model of Product
module.exports = mongoose.model('Product', productSchema);
