//intial import
const mongoose = require('mongoose');

//creating Order Schema
const orderSchema = new mongoose.Schema({
	product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
});

//export model of Order
module.exports = mongoose.model('Order', orderSchema);
