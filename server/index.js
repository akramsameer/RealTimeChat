const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  logger = require('morgan'),
  socketEvents = require('./socketEvents');

const config = require('./config/main');
const router = require('./router');

const server = app.listen(config.port, () => {
  console.log(`your server is running on port ${config.port}.`);
});

// Socket
const io = require('socket.io').listen(server);

socketEvents(io);

// Setting up basic middleware for all Express requests
app.use(logger('dev')); // Log requests to API using morgan
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Enable CORS from client-side
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

//Database Connection
mongoose.connect(config.database);

// Import routes to be served
router(app);
