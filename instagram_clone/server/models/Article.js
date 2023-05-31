const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// luxon 날짜 데이터를 처리하는 패키지
const { DateTime } = require('luxon');

const articleSchema = new Schema({
  photos: [{ type: String, required: true }],
  description: { type: String },
  // 게시물 작성 (required: true 반듯이 필요하다!)
  author: { type: Schema.ObjectId, required: true, ref: 'User' },
  // 좋아요갯수
  favoriteCount: { type: Number, default: 0 },
  // 생성날자
  created: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// 보여주기용 날짜 생성 메서드
articleSchema.virtual('displayDate').get(function () {
  return DateTime
    .fromJSDate(this.created)
    .toLocaleString(DateTime.DATE_MED);
})

// 컬렉션 조인 (댓글 갯수)
articleSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'article',
  count: true
})

// 컬렉션 조인 (좋아요 데이터)
articleSchema.virtual('isFavorite', {
  ref: 'Favorite',
  localField: '_id',
  foreignField: 'article',
  justOne: true
})

module.exports = mongoose.model('Article', articleSchema)