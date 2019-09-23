const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	name: { type: String, required: true },
	email: {
		type: String,
		required: true,
		match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
	},
	userName: { type: String, required: true },
	password: { type: String, required: true },
	phoneNumber: { type: Number, required: true },
	products: { type: [mongoose.Schema.Types.ObjectId], ref: 'Product', default: null },
	orders: { type: [mongoose.Schema.Types.ObjectId], ref: 'Order', default: null }
});

module.exports = mongoose.model('User', userSchema);
