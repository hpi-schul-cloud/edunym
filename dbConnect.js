const mongoose = require('mongoose');
const debug = require('debug')('edunym:server');
const config = require('./config.js');

mongoose.connect(config.mongo, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
const db = mongoose.connection;
db.on('error', (error) => { debug(`MongoDB connection error: ${error}`); });

module.exports = mongoose;
