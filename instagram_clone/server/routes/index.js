// 라우터 : 클라이언트의 요청과 적합한 로직을 연결한다

const express = require('express')
const router = express.Router();
const passport = require("passport");
const auth = passport.authenticate("jwt", { session: false });
const jwtStrategy = require("../auth/jwtStrategy");
const articleController = require("../controllers/articleController");
const commentController = require("../controllers/commentController");
const userController = require("../controllers/userController");
const profileController = require("../controllers/profileController");

passport.use(jwtStrategy);
