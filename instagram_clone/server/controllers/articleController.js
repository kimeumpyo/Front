const User = require('../models/User');
const Follow = require('../models/Follow');
const Article = require('../models/Article');
const Favorite = require('../models/Favorite');
// 1. 파일 처리 라이브러리
const fileHandler = require('../utils/fileHandler');

// 2. 피드 가져오기 로직
exports.feed = async (req, res, next) => { 
  try {
    // Follow 컬렉션의 도큐먼트 중 팔로워가 로그인 유저인 도큐먼트
    const follows = await Follow.find({ follower: req.user._id });
    // follows에서 following 값만 추출하여 리스트를 생성한다
    // 로그인 유저가 팔로우하는 유저들의 id 리스트
    const followings = follows.map(follow => follow.following);

    const where = { author: [...followings, req.user._id] } // 검색 조건
    const limit = req.query.limit || 5; // 한번 클라이언트에 전송할 때 보낼 도큐먼트의 수
    const skip = req.query.skip || 0; // 건너 뛸 도큐먼트의 수

    const articleCount = await Article.count(where); // 조건에 맞는 게시물 갯수
    
    const articles = await Article
      .find(where)
      .populate({ // 컬렉션 조인
        path: 'author',
        select: 'username avatar' // 필드 선택
      })
      .populate({
        path: 'isFavorite'
      })
      .populate({
        path: 'commentCount'
      })
      .sort({ created: 'desc' })
      .skip(skip)
      .limit(limit)

    res.json({ articles, articleCount });

  } catch (error) {
    next(error)
  }
};

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

    res.json({ article }); // 클라이언트에게 전송

  } catch (error) {
    next(error)
  }
};

// 5. 게시물 생성하기 로직
exports.create = [
  fileHandler('articles').array('photos'), // 파일 처리
  async (req, res, next) => {
    try {

      const files = req.files;

      if (files.length < 1) { // 파일이 없을  경우
        const err = new Error('File is required');
        err.status = 400; // 클라이언트 오류
        throw err;
      }

      const photos = files.map(file => file.filename); // 파일 이름으로 이루어진 배열을 생성한다

      const article = new Article({ // 새로운 인스턴스 생성
        photos, // 파일 이름 리스트
        author: req.user._id, // 로그인 유저
        description: req.body.description
      });

      await article.save(); // 저장

      res.json({ article }); // 클라이언트에게 전송

    } catch (error) {
      next(error)
    }
  }
];

// 6. 게시물 삭제
exports.delete = async (req, res, next) => {
  try {
    // 삭제할 게시물을 검색한다
    const article = await Article.findById(req.params.id);

    if (!article) { // 게시물이 존재하지 않을 경우
      const err = new Error("Article not found")
      err.status = 404; // 리소스 없음
      throw err;
    }

    // 본인 게시물이 아닌 경우
    if (req.user._id.toString() !== article.author.toString()) { // 문자열로 변환하여 비교
      const err = new Error("Author is not correct")
      err.staus = 400;
      throw err;
    }

    await article.deleteOne(); // 삭제

    res.json({ article }); //   삭제한 게시물을 클라이언트에게 전송

  } catch (error) {
    next(error)
  }
 };

// 7. 좋아요
exports.favorite = async (req, res, next) => {
  try {
    // 좋아요 처리를 할 게시물을 검색한다
    const article = await Article.findById(req.params.id);

    if (!article) { // 게시물이 존재하지 않을 때
      const err = new Error("Article not found");
      err.status = 404; // NotFound
      throw err;
    }

    // 이미 좋아요 한 게시물인지 확인한다
    const _favorite = await Favorite
      // req.user : 로그인 유저 객체
      .findOne({ user: req.user._id, article: article._id })

    // 처음 좋아요 요청한 게시물이면
    if (!_favorite) {
      const favorite = new Favorite({
        user: req.user._id,
        article: article._id
      })
      await favorite.save(); // Favorite의 도큐먼트를 생성한다

      article.favoriteCount++; // 게시물의 좋아요수를 1증가시킨다
      await article.save(); // 변경사항을 저장한다
    }

    res.json({ article }) // 좋아요 처리를 완료한 게시물을 전송한다

  } catch (error) {
    next(error)
  }
};

// 8. 좋아요 취소
exports.unfavorite = async (req, res, next) => {
  try {
    // 좋아요 취소할 게시물을 검색한다
    const article = await Article.findById(req.params.id);

    if (!article) { // 게시물이 존재하지 않을 때
      const err = new Error("Article not found");
      err.status = 404; // NotFound
      throw err;
    }

    const favorite = await Favorite
      .findOne({ user: req.user._id, article: article._id });

    if (favorite) { // 좋아요 처리가 된 게시물이 맞으면
      await favorite.deleteOne(); // Favorite의 도큐먼트를 삭제한다

      article.favoriteCount--; // 게시물의 좋아요수를 1감소시킨다
      await article.save(); // 변경사항을 저장한다
    }

    res.json({ article }); // 좋아요 취소를 완료한 게시물을 전송한다

  } catch (error) {
    next(error)
  }
};