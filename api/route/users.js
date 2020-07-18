//initial import
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//import user Schema
const User = require('../model/user');
const checkAuth = require('../middleware/Auth/check-auth');

//creating routes to /api/users
const router = express.Router();

//post request for signup
router.post('/signup', (req, res, next) => {
	User.findOne({ email: req.body.email })
		.exec()
		.then((availableUser) => {
			if (availableUser)
				return res.status(409).json({
					error: {
						message: 'User already exists',
					},
				});
			return bcrypt.hash(req.body.password, 10);
		})
		.then((hash) => {
			const user = new User({
				name: req.body.name,
				email: req.body.email,
				userName: req.body.userName,
				password: hash,
				mobileNumber: req.body.mobileNumber,
			});
			return user.save();
		})
		.then(() => {
			res.status(201).json({
				message: 'User Created',
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//post request for login
router.post('/login', (req, res, next) => {
	User.findOne({ email: req.body.email })
		.exec()
		.then((availableUser) => {
			if (!availableUser)
				return res.status(401).json({
					error: {
						message: 'Auth failed',
					},
				});
			bcrypt.compare(req.body.password, availableUser.password, function (
				err,
				validPassword
			) {
				if (!validPassword)
					return res.status(401).json({ error: { message: 'Auth failed' } });
				const token = jwt.sign(
					{ id: availableUser._id, email: availableUser.email },
					process.env.SECRET_KEY,
					{
						expiresIn: '1h',
					}
				);
				const refreshToken = jwt.sign(
					{ id: availableUser._id, email: req.body.email },
					process.env.SECRET_REFRESH_KEY,
					{
						expiresIn: '7d',
					}
				);
				User.findOneAndUpdate(
					{ email: availableUser.email },
					{ $set: { token: token, refreshToken: refreshToken } },
					{ new: true }
				)
					.exec()
					.then((updatedUser) => {
						const token = jwt.decode(updatedUser.token, process.env.SECRET_KEY);
						const refreshToken = jwt.decode(
							updatedUser.refreshToken,
							process.env.SECRET_REFRESH_KEY
						);
						res.status(200).json({
							message: 'Auth Successfull',
							userId: token.id,
							email: token.email,
							token: updatedUser.token,
							tokenExpirationTime: token.exp - token.iat,
							refreshToken: updatedUser.refreshToken,
							refreshTokenExpirationTime: refreshToken.exp - refreshToken.iat,
						});
					})
					.catch((err) => {
						res.status(401).json({
							error: {
								message: 'Auth failed',
							},
						});
					});
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//post request for token exchange
router.post('/token', (req, res, next) => {
	User.findOne({ email: req.body.email, refreshToken: req.body.refreshToken })
		.exec()
		.then((availableUser) => {
			if (!availableUser)
				return res.status(401).json({ error: { message: 'Auth failed' } });
			try {
				const refresh = jwt.verify(
					req.body.refreshToken,
					process.env.SECRET_REFRESH_KEY
				);
				const token = jwt.sign(
					{ id: availableUser._id, email: availableUser.email },
					process.env.SECRET_KEY,
					{
						expiresIn: '1h',
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
							expiresIn: '1h',
						}
					);
					const refreshToken = jwt.sign(
						{ id: availableUser._id, email: req.body.email },
						process.env.SECRET_REFRESH_KEY,
						{
							expiresIn: '7d',
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
		.then((updatedUser) => {
			if (!updatedUser)
				return res.status(401).json({ error: { message: 'Auth failed' } });
			res.status(200).json(updatedUser);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//patch request to update profile
router.patch('/myprofile/:userId', checkAuth, (req, res, next) => {
	const id = req.params.userId;
	const updateOps = {};
	for (const ops of req.body) updateOps[ops.propName] = ops.value;
	User.findOneAndUpdate({ _id: id }, { $set: updateOps }, { new: true })
		.select('name userName mobileNumber')
		.exec()
		.then((updatedUser) => {
			if (!updatedUser)
				res.status(404).json({ error: { message: 'Page Not Found.' } });
			res.status(200).json(updatedUser);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//get request for profile
router.get('/myprofile', checkAuth, (req, res, next) => {
	User.findOne({ _id: req.user.id })
		.select('name userName mobileNumber')
		.exec()
		.then((user) => {
			if (!user)
				res.status(404).json({ error: { message: 'Page Not Found.' } });
			res.status(200).json(user);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

//module export
module.exports = router;
