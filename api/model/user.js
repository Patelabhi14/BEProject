//intial import
const mongoose = require('mongoose');

//creating User Schema
const userSchema = mongoose.Schema({
	name: { type: String, required: true },
	email: {
		type: String,
		required: true,
		match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
	},
	userName: { type: String, required: true },
	password: { type: String, required: true },
	mobileNumber: { type: Number, required: true },
	token: { type: String },
	refreshToken: { type: String }
});

//export user model
module.exports = mongoose.model('User', userSchema);
