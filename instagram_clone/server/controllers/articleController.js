const User = require('../models/User');
const Follow = require('../models/Follow');
const Article = require('../models/Article');
const Favorite = require('../models/Favorite');
// 1. 파일 처리 라이브러리
const fileHandler = require('../utils/fileHandler');

// 2. 피드 가져오기 로직
exports.feed = async (req, res, next) => { };

// 3. 게시물 가져오기 로직
exports.find = async (req, res, next) => {

  try {
    const where = {} // 검색 조건
    const limit = req.query.limit || 9 // 클라이언트에게 한번 전송할 때 보낼 도큐먼트의 수
    const skip = req.query.skip || 0 // 건너 뛸 도큐먼트의 수

    if ('username' in req.query) { // 프로필의 타임라인 게시물
      const user = await User.findOne({ username: req.query.username });
      where.author = user._id; // 검색 조건 추가
    }

    const articleCount = await Article.count(where); // 게시물의 개수
    const articles = await Article
      // find메서드 게시물을 여러개 검색할 때 사용
      .find(where, 'photos favoriteCount created') // find(검색조건, 검색필드 - 사진, 좋아요수, 게시물수)
      .populate({
        path: 'commentCount' // 컬렉션 조인: 게시물에 달린 댓글 갯수를 알 수 있다
      })
      .sort({ created: 'desc' }) // 생성일 기준 내림차순으로 정렬
      .limit(limit)
      .skip(skip)

    res.json({ articles, articleCount }); // 클라이언트에게 검색 결과를 전송

  } catch (error) {
    next(error)
  }
};

// 4. 게시물 한개 가져오기
exports.findOne = async (req, res, next) => {
  // 틀정 게시물을 클릭시 보는 페이지
  try {
    const article = await Article
      .findById(req.params.id)  // id로 게시물을 검색한다
      .populate({ // populate == join 이랑 비슷한개념
        path: 'author', // User 컬렉션과 조인
        select: 'username avatar'  // 필드 선택 : 유저내임과 아바타만 가져온다
      })
      .populate({
        path: 'isFavorite'  // Favorite 컬렉션과 조인
      })
      .populate({
        path: 'commentCount'  // Comment 컬렉션과 조인 (댓글 갯수)
      })  

    if (!article) { // 게시물이 없다면!
      const err = new Error("Article not found");
      err.status = 404; // NotFound 오류 (리소스 없음)
      throw err;
    }

    res.json({ article });

  } catch (error) {
    next(error)
  }
};

// 5. 게시물 생성하기 로직
exports.create = [];

// 6. 게시물 삭제
exports.delete = async (req, res, next) => { };

// 7. 좋아요
exports.favorite = async (req, res, next) => { };

// 8. 좋아요 취소
exports.unfavorite = async (req, res, next) => { };