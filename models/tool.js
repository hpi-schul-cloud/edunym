const mongoose = require('../dbConnect.js');

const toolSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  publicKey: { type: String, required: true },
}, {
  timestamps: true,
});

toolSchema.index({ clientId: 1 }, { unique: true });

module.exports = mongoose.model('Tool', toolSchema);
