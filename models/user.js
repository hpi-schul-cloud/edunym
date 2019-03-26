const mongoose = require('mongoose');
const uuid = require('uuid');
const debug = require('debug')('edunym:server');
const config = require('../config.js');

mongoose.connect(config.mongo, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (error) => { debug(`MongoDB connection error: ${error}`); });

const userSchema = new mongoose.Schema({
  id: String,
  pseudonym: { type: String, required: true, default: uuid },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
