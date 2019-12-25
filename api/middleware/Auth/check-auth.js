//intial import
const jwt = require('jsonwebtoken');
require('dotenv').config();

//export jwt verification function
module.exports = (req, res, next) => {
	try {
		const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET_KEY);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({
			message: 'Auth failed'
		});
	}
};
