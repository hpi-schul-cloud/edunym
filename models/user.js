const uuid = require('uuid');
const mongoose = require('../dbConnect.js');

const userSchema = new mongoose.Schema({
  idPlatform: { type: String, required: true },
  audTool: { type: String, required: true },
  idTool: { type: String, required: true, default: uuid },
}, {
  timestamps: true,
});

userSchema.index({ idPlatform: 1, audTool: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
