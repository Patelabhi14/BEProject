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
			if (availableUser)
				return res.status(409).json({
					error: {
						message: 'User already exists'
					}
				});
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
			if (!availableUser)
				return res.status(401).json({
					error: {
						message: 'Auth failed'
					}
				});
			bcrypt.compare(req.body.password, availableUser.password, function(err, validPassword) {
				if (!validPassword)
					return res.status(401).json({ error: { message: 'Auth failed' } });
				const token = jwt.sign(
					{ id: availableUser._id, email: availableUser.email },
					process.env.SECRET_KEY,
					{
						expiresIn: '30s'
					}
				);
				const refreshToken = jwt.sign(
					{ id: availableUser._id, email: req.body.email },
					process.env.SECRET_REFRESH_KEY,
					{
						expiresIn: '1m'
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
	User.findOne({ email: req.body.email, refreshToken: req.body.refreshToken })
		.exec()
		.then(availableUser => {
			if (!availableUser) return res.status(401).json({ error: { message: 'Auth failed' } });
			try {
				const refresh = jwt.verify(req.body.refreshToken, process.env.SECRET_REFRESH_KEY);
				const token = jwt.sign(
					{ id: availableUser._id, email: availableUser.email },
					process.env.SECRET_KEY,
					{
						expiresIn: '1h'
					}
				);
				return User.findOneAndUpdate(
					{ email: availableUser.email },
					{ $set: { token } },
					{ new: true }
				)
					.select('token')
					.exec();
			} catch (invalidRefreshToken) {
				if (invalidRefreshToken.name === 'TokenExpiredError') {
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
						{ $set: { token, refreshToken } },
						{ new: true }
					)
						.select('token refreshToken')
						.exec();
				}
			}
		})
		.then(updatedUser => {
			if (!updatedUser) return res.status(401).json({ error: { message: 'Auth failed' } });
			res.status(200).json(updatedUser);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

//module export
module.exports = router;
