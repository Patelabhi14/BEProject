const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../model/user');

const router = express.Router();

router.post('/signup', (req, res, next) => {
	User.findOne({ email: req.body.email })
		.exec()
		.then(availableUser => {
			console.log(availableUser);
			if (availableUser) {
				return res.status(409).json({
					error: {
						message: 'Entered mail exists'
					}
				});
			}
			bcrypt.hash(req.body.password, 10, (err, hash) => {
				if (err) {
					return res.status(500).json({
						error: err
					});
				}
				const user = new User({
					name: req.body.name,
					email: req.body.email,
					userName: req.body.userName,
					password: hash,
					phoneNumber: req.body.phoneNumber,
					products: req.body.products
				});
				return user.save();
			});
		})
		.then(() => {
			res.status(201).json({
				message: 'User Created'
			});
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

module.exports = router;
