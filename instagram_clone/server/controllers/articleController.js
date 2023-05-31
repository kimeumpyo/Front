const User = require('../models/User');
const Follow = require('../models/Follow');
const Article = require('../models/Article');
const Favorite = require('../models/Favorite');
// 1. 파일 처리 라이브러리
const fileHandler = require('../utils/fileHandler');

// 2. 피드 가져오기 로직
exports.feed = async (req, res, next) => { };

// 3. 게시물 가져오기 로직
exports.find = async (req, res, next) => { };

// 4. 게시물 한개 가져오기
exports.findOne = async (req, res, next) => { };

// 5. 게시물 생성하기 로직
exports.create = [];

// 6. 게시물 삭제
exports.delete = async (req, res, next) => { };

// 7. 좋아요
exports.favorite = async (req, res, next) => { };

// 8. 좋아요 취소
exports.unfavorite = async (req, res, next) => { };