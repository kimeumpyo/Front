const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const followSchema = new Schema({
  // User 참조
  follower: { type: Schema.ObjectId, required: true, ref: 'User' },
  following: { type: Schema.ObjectId, required: true, ref: 'User' }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

module.exports = mongoose.model('Follow', followSchema);