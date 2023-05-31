const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  // 댓글내용
  content: { type: String },
  // 어떤 게시물이 달린 게시물인지
  article: { type: Schema.ObjectId, required: true },
  // 댓글 작성 User모델을 참조
  author: { type: Schema.ObjectId, required: true, ref: 'User' },
  // 댓글 생성
  created: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

module.exports = mongoose.model('Comment', commentSchema);