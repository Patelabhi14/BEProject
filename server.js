//intial import
const http = require('http');
const app = require('./app');

//set port number
const port = process.env.PORT || 3000;

//creating server
const server = http.createServer(app);

//listening to port
server.listen(port);
