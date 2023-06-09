const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');

// 1. 댓글 가져오기 로직
exports.find = async (req, res, next) => {

  try {
    // 댓글을 가져올 게시물을 검색한다
    const article = await Article.findById(req.params.id);

    const where = { article: article._id }; // 검색조건
    const limit = req.query.limit || 10;
    const skip = req.query.skip || 0;

    const commentCount = await Comment.count(where); // 댓글 갯수
    const comments = await Comment
      .find(where)
      .populate({
        path: 'author', // 도큐먼트 검색
        select: 'username avatar'
      })
      .sort({ created: 'desc' })  // 생성일중 내림차순
      .limit(limit)
      .skip(skip)

    res.json({ comments, commentCount });

  } catch (error) {
    next(error)
  }
};

// 2. 댓글 생성
exports.create = async (req, res, next) => {
  try {
    const _comment = new Comment({
      article: req.params.id, // 댓글을 단 게시물의 _id
      content: req.body.content,  // 댓글 내용
      author: req.user._id  // 댓글 작성자
    })

    await _comment.save(); // 댓글 저장

    const comment = await _comment
      .populate({
        path: 'author', // User 컬렉션과 조인
        select: 'username avatar'
      })

    res.json({ comment })

  } catch (error) {
    next(error)
  }
};

// 3. 댓글 삭제
exports.delete = async (req, res, next) => {
  try {
    // 삭제할 댓글을 검색한다
    const comment = await Comment
      .findById(req.params.id);

    if (!comment) { // 댓글이 존재하지 않는 경우
      const err = new Error("Comment not found")
      err.status = 404;
      throw err;
    }

    // 본인이 작성한 댓을이 아닌 경우
    if (req.user._id.toString() !== comment.author.toString()) {
      const err = new Error("incorrect user");
      err.status = 400;
      throw err;
    }

    await comment.deleteOne();

    res.json({ comment });

  } catch (error) {
    next(error)
  }
};