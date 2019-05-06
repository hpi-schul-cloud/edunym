const mongoose = require('../dbConnect.js');

const toolSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true },
  publicKey: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Tool', toolSchema);
