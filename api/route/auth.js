const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../model/user');

const router = express.Router();

const refreshList = {};

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
			bcrypt.compare(req.body.password, availableUser.password, (err, result) => {
				if (err) {
					return res.status(401).json({
						error: {
							message: 'Auth failed'
						}
					});
				}
				if (result) {
					const token = jwt.sign(
						{ id: availableUser._id, email: availableUser.email },
						process.env.SECRET_KEY,
						{
							expiresIn: '15m'
						}
					);
					const refreshToken = jwt.sign(
						{ email: req.body.email },
						process.env.SECRET_REFRESH_KEY,
						{
							expiresIn: '24h'
						}
					);
					const response = {
						message: 'Auth successfull',
						token: token,
						refreshToken: refreshToken
					};
					refreshList[refreshToken] = response;
					return res.status(200).json(response);
				}
				res.status(401).json({
					error: {
						message: 'Auth failed'
					}
				});
			});
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});
router.post('/token', (req, res, next) => {
	if (req.body.refreshToken && req.body.refreshToken in refreshList) {
		const token = jwt.sign({ email: req.body.email }, process.env.SECRET_KEY, {
			expiresIn: '15m'
		});
		const response = {
			token: token
		};
		refreshList[req.body.refreshToken].token = token;
		res.status(200).json(response);
	} else {
		res.status(404).send('Invalid request');
	}
});

module.exports = router;
