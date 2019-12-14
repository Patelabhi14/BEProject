//initial import
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//import user Schema
const User = require('../model/user');

//creating routes to /api/users
const router = express.Router();

//post request for signup
router.post('/signup', (req, res, next) => {
	User.findOne({ email: req.body.email })
		.exec()
		.then(availableUser => {
			console.log(availableUser);
			if (availableUser) {
				return res.status(409).json({
					error: {
						message: 'User already exists'
					}
				});
			}
			return bcrypt.hash(req.body.password, 10);
		})
		.then(hash => {
			const user = new User({
				name: req.body.name,
				email: req.body.email,
				userName: req.body.userName,
				password: hash,
				phoneNumber: req.body.phoneNumber
			});
			return user.save();
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
//post request for login
router.post('/login', (req, res, next) => {
	User.findOne({ email: req.body.email })
		.exec()
		.then(availableUser => {
			if (!availableUser) {
				return res.status(401).json({
					error: {
						message: 'Auth failed'
					}
				});
			}
			bcrypt.compare(req.body.password, availableUser.password, function(err, result) {
				if (!result) return res.status(401).json({ error: { message: 'Auth failed' } });
				const token = jwt.sign(
					{ id: availableUser._id, email: availableUser.email },
					process.env.SECRET_KEY,
					{
						expiresIn: '1h'
					}
				);
				const refreshToken = jwt.sign(
					{ id: availableUser._id, email: req.body.email },
					process.env.SECRET_REFRESH_KEY,
					{
						expiresIn: '7d'
					}
				);
				User.findOneAndUpdate(
					{ email: availableUser.email },
					{ $set: { token: token, refreshToken: refreshToken } },
					{ new: true }
				)
					.exec()
					.then(updatedUser => {
						res.status(200).json({
							message: 'Auth Successfull',
							token: updatedUser.token,
							refreshToken: updatedUser.refreshToken
						});
					})
					.catch(err => {
						res.status(401).json({
							error: {
								message: 'Auth failed'
							}
						});
					});
			});
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});
//post request for token exchange
router.post('/token', (req, res, next) => {
	jwt.verify(req.body.refreshToken, process.env.SECRET_REFRESH_KEY, function(refresh, decoded) {
		if (!refresh) res.status(200).json(decoded);
		else if (refresh.name === 'TokenExpiredError') {
			User.findOne({ email: req.body.email })
				.exec()
				.then(availableUser => {
					if (!availableUser)
						return res.status(401).json({ error: { message: 'Auth failed' } });
					const token = jwt.sign(
						{ id: availableUser._id, email: availableUser.email },
						process.env.SECRET_KEY,
						{
							expiresIn: '1h'
						}
					);
					const refreshToken = jwt.sign(
						{ id: availableUser._id, email: req.body.email },
						process.env.SECRET_REFRESH_KEY,
						{
							expiresIn: '7d'
						}
					);
					return User.findOneAndUpdate(
						{ email: availableUser.email },
						{ $set: { token: token, refreshToken: refreshToken } },
						{ new: true }
					).exec();
				})
				.then(updatedUser => {
					res.status(200).json({
						message: 'Auth Successfull',
						token: updatedUser.token,
						refreshToken: updatedUser.refreshToken
					});
				})
				.catch(err => {
					res.status(401).json({
						error: {
							message: 'Auth failed'
						}
					});
				});
		} else res.status(401).json({ error: { message: 'Auth failed' } });
	});
});

//module export
module.exports = router;
