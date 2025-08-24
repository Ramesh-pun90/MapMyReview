const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User' },      // यो हुन जरुरी छ
  recipient: { type: Schema.Types.ObjectId, ref: 'User' },   // यो पनि हुन सक्छ
  subject: String,
  body: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
