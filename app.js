//intial imports
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

//importing routes
const productRoutes = require('./api/route/products');
const orderRoutes = require('./api/route/orders');
const requestRoutes = require('./api/route/requests');
const userRoutes = require('./api/route/users');
const uploadRoutes = require('./api/route/uploads');

//starting the express server
const app = express();

//connecting to mongoDB
//`mongodb://assetera07:${process.env.MONGO_PASS}@cluster0-shard-00-01-cpwhm.mongodb.net:27017/Assetera?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`
mongoose
	.connect('mongodb://localhost:27017/BEProject', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log('Connected Successfully');
	})
	.catch((err) => {
		console.log(err);
	});

//request parsing
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//handling CORS
app.use((req, res, next) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.set(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	if (req.method === 'OPTIONS') {
		res.set('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE');
		return res.status(200).json({});
	}
	next();
});

//request handling
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);

//genral error handling
app.use((req, res, next) => {
	const err = new Error('Page Not Found');
	err.status = 404;
	next(err);
});
app.use((err, req, res, next) => {
	res.status(err.status).json({
		error: err,
	});
});

//module export
module.exports = app;
