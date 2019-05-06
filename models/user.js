const uuid = require('uuid');
const mongoose = require('../dbConnect.js');

const userSchema = new mongoose.Schema({
  idPlatform: { type: String, required: true, index: true },
  audTool: { type: String, required: true, index: true },
  idTool: { type: String, required: true, default: uuid },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
