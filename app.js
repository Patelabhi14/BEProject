const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const productRoutes = require('./api/route/products');
const orderRoutes = require('./api/route/orders');
const userRoutes = require('./api/route/users');

const app = express();

mongoose
	.connect('mongodb://localhost:27017/BEProject', {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => {
		console.log('Connected Successfuly');
	})
	.catch(err => {
		console.log(err);
	});

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.use((req, res, next) => {
	const err = new Error('Page Not Found');
	err.status = 404;
	next(err);
});
app.use((err, req, res, next) => {
	res.status(err.status).json({
		error: err
	});
});

module.exports = app;
