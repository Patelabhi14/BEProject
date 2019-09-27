const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
	try {
		const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET_KEY);
		next(decoded);
	} catch (err) {
		return res.status(401).json({
			message: 'Auth failed'
		});
	}
};
