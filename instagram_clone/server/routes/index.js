// 라우터 : 클라이언트의 요청과 적합한 로직을 연결한다

const express = require('express');
const router = express.Router();
// 인증 처리 패키지
const passport = require("passport");
const auth = passport.authenticate("jwt", { session: false });
// 라이브러리
// auth 폴더안의 jwtStrategy파일
const jwtStrategy = require("../auth/jwtStrategy"); 
// controllers 폴더안의 파일
const articleController = require("../controllers/articleController");
const commentController = require("../controllers/commentController");
const userController = require("../controllers/userController");
const profileController = require("../controllers/profileController");

passport.use(jwtStrategy);

// INDEX
router.get("/", (req, res)=>{
  // 서버의 응답(response)
  res.json({message: "API Server - INDEX PAGE"});
})
/*
  HTTP 요청(Request) 메서드
  1. GET - 데이터를 읽을 때 사용하는 메서드
  2. POST - 데이터를 생성할 때 사용하는 메서드
  3. PUT -  데이터를 수정할 때 사용하는 메서드
  4. DELETE - 데이터를 삭제할 때 사용하는 메서드
*/

// USERS 
router.post('/users', userController.create); 
// auth : 인증이 필요한 라우터
router.put('/user', auth, userController.update); 
router.post('/user/login', userController.login); 

// ARTICLES
router.get('/feed', auth, articleController.feed) 
router.get('/articles', auth, articleController.find)
router.post('/articles', auth, articleController.create)  
router.get('/articles/:id', auth, articleController.findOne)
router.delete('/articles/:id', auth, articleController.delete) 
router.post('/articles/:id/favorite', auth, articleController.favorite) 
router.delete('/articles/:id/favorite', auth, articleController.unfavorite)

// COMMENTS
router.get('/articles/:id/comments', auth, commentController.find) 
router.post('/articles/:id/comments', auth, commentController.create) 
router.delete('/comments/:id', auth, commentController.delete) 

// PROFILES
router.get('/profiles', auth, profileController.find); 
router.get('/profiles/:username', auth, profileController.findOne)
router.post('/profiles/:username/follow', auth, profileController.follow) 
router.delete('/profiles/:username/follow', auth, profileController.unfollow)

module.exports = router;