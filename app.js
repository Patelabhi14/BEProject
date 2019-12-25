//intial imports
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

//importing routes
const productRoutes = require('./api/route/products');
const orderRoutes = require('./api/route/orders');
const userRoutes = require('./api/route/users');

//starting the express server
const app = express();

//connecting to mongoDB
mongoose
	.connect('mongodb://localhost:27017/BEProject', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.then(() => {
		console.log('Connected Successfully');
	})
	.catch(err => {
		console.log(err);
	});

//request parsing
app.use(morgan('dev'));
app.use(express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//handling CORS
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE');
		return res.status(200).json({});
	}
	next();
});

//request handling
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

//genral error handling
// app.use((req, res, next) => {
// 	const err = new Error('Page Not Found');
// 	err.status = 404;
// 	next(err);
// });
// app.use((err, req, res, next) => {
// 	res.status(err.status).json({
// 		error: err
// 	});
// });

//module export
module.exports = app;
