const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwevtoken");
const crypto = require('crypto');

// 1.
const UserSchema = new Schema({
    // 1번째 객체
    // 이름 최소길이3 ~ 최대길이100
    username: { type: String, required: true, minLength: 3, maxLength: 100 },
    // 비번 최소길이5
    password: { type: String, minLength: 5},
    // 비번 암호화
    salt: { type: String },
    // 이메일
    email: { type: String, required: true, maxLength: 100 },
    // 전체이름
    fullName: { type: String },
    // 프로필이미지
    avatar: {type: String, default:"default.png" },
    // 자기소개
    bio: { type: String },
  },
  {
    // 2번째 객체 toJSON,toObject(mongoDB에서 필요한 값)
    toJSON:{virtuals:true},
    toObject:{ virtuals:true}
  })

  // 2. 컬렉션 조인(Join)
    userSchema.virtual('isFollowing', {
    ref: "Follow",
    localField: "_id",
    foreignField: "following",
    justOne: true
  })

  // 3. 토큰 생성 메서드
  userSchema.methods.generateJWT = function () {
    return jwt.sign({ username: this.username }, process.env.SECRET);
  }

  // 4. 비밀번호 암호화
  userSchema.methods.setPassword = function (password) {
    // 비밀번호 암호화에 사용되는 키
    this.salt = crypto
      .randomBytes(16).toString("hex");
  
    this.password = crypto // crypto 내장기능
        // pbkdf2 암호 알고리즘 Sync동기함수
      .pbkdf2Sync(password, this.salt, 310000, 32, "sha256") // sha256 알고리즘
      .toString("hex") // 결과값을 16진수로 나타내는 문자열
  }

  // 비밀번호 확인 메서드
  userSchema.methods.checkPassword = function (password) {
    const hashedPassword = crypto
        // 유저의 password 생성당시 와 동일하게 salt(암호화)
      .pbkdf2Sync(password, this.salt, 310000, 32, "sha256")
      .toString("hex")

    // 생성당시 와 비교
    return this.password === hashedPassword;
  }

  module.exports = mongoose.model("User", userSchema);