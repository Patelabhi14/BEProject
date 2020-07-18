//intial import
const mongoose = require('mongoose');

//creating Product Schema
const productSchema = new mongoose.Schema({
	title: { type: String, required: true },
	price: { type: Number, required: true },
	description: { type: String, default: '' },
	category: {
		type: String,
		required: true,
		enum: ['Electronic', 'Place', 'Automobile'],
	},
	isBooked: {
		type: String,
		enum: ['pending', 'accept', 'decline'],
		default: 'pending',
	},
	userId: { type: String, required: true },
	location: {
		lat: { type: Number, required: true },
		lng: { type: Number, required: true },
		staticImgUrl: { type: String, required: true },
	},
	imageUrl: { type: String },
});

//export model of Product
module.exports = mongoose.model('Product', productSchema);
