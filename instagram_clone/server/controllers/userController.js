const User = require('../models/User'); // User 모델
const fileHandler = require('../utils/fileHandler');    // 파일 처리 패키지(라이브러리)
// 유효성 검사 패키지(라이브러리)
const { body, validationResult } = require('express-validator');

/*
  입력 데이터 유효성 검사에 필요한 변수들

*/

//  4. 유효한 유저이름인지 확인
const isValidUsername = () => body('username')
  // 문자열의 앞뒤 공백을 제거한다
  .trim()
  // 최소 5글자가
  .isLength({ min: 5 }).withMessage('Username must be at least 5 characters')
  // 알파벳과 숫자만 가능하다
  .isAlphanumeric().withMessage('Username is only allowed in alphabet and number')

// 5. 유효한 이메일인지 확인 
const isValidEmail = () => body('email')
  .trim()
  .isEmail().withMessage('E-mail is not valid')

// 6. 유효한 비밀번호인지 확인
const isValidPassword = () => body('password')
  .trim()
  .isLength({ min: 5 }).withMessage('Password must be at least 5 characters')

// 7. 이메일 중복검사
const emailInUse = async (email) => {
  const user = await User.findOne({ email }); // User 컬렉션을 검색한다

  if (user) {
    // 동일한 이메일확인
    return Promise.reject('E-mail is already in use');
  }
}

// 8. 유저이름 중복검사
const usernameInUse = async (username) => {
  const user = await User.findOne({ username });

  if (user) {
    return Promise.reject('Username is already in use');
  }
}

// 9. 이메일의 존재 여부 ( 로그인 시 사용 )
const doesEmailExists = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    return Promise.reject('User is not found');
  }
}

// 10. 패스워드 일치 여부 ( 로그인 )
const doesPasswordMatch = async (password, { req }) => {
  const email = req.body.email;
  const user = await User.findOne({ email });

  if (!user.checkPassword(password)) {
    return Promise.reject('Password does not match');
  }
}
// 1. 회원가입 로직
exports.create = [
  isValidUsername().custom(usernameInUse),
  isValidEmail().custom(emailInUse),
  isValidPassword(),
  async (req, res, next) => {
    // 가입절차
    try {
      const errors = validationResult(req); // 유효성 검사 결과

      // 유효성 검사 실패
      if (!errors.isEmpty()) {
        const err = new Error(); // err 객체를 만들어준다
        err.errors = errors.array(); // 에러 배열을 만들어준다
        err.status = 400; // 서버에 응답코드 400(Bad Request) 보통 4로 시작하는것들은 클라이언트 잘못
        throw err;
      }

      // 클라이언트가 전송한 데이터
      const { email, fullName, username, password } = req.body;

      // 새로운 유저를 생성한다
      const user = new User();

      user.username = username;
      user.email = email;
      user.fullName = fullName;
      user.setPassword(password); // 비밀번호 암호화

      // 유저에 데이터에 저장
      await user.save();

      // response 서버응답 클라이언트에게 생성한 객체를 전송한다
      res.json({ user });

    } catch (error) {
      next(error) // 전달받은 에러를 에러 핸들러에 전달한다 (app.js)
    }
  }
];

// 2. 정보 수정 로직
exports.update = [
  fileHandler('profiles').single('avatar'), // 사진을 업로드했을 때
  isValidUsername().custom(usernameInUse).optional(), // 유효성검사, 옵션
  isValidEmail().custom(emailInUse).optional(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const err = new Error();
        err.errors = errors.array();
        err.status = 400; // 검사 실패시 400 에러발생
        throw err;
      }

      const _user = req.user; // req.user: user 도큐먼트 (auth 폴더 jwtStartegy에 6번째 참고)

      if (req.file) {
        // 파일이 있는 경우 user의 avatar(프로필 사진)을 업데이트 한다
        _user.avatar = req.file.filename;
      }

      // user객체 중에서 클라이언트가 요청한 속성만 업데이트한다
      // 참고 Object.assign) 
      // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
      Object.assign(_user, req.body);

      // 변경사항을 저장한다
      await _user.save();

      // 토큰 재생성 (유저데이터 업데이트때문)
      const token = _user.generateJWT();

      const user = {
        username: _user.username,
        email: _user.email,
        fullName: _user.fullName,
        avatar: _user.avatar,
        bio: _user.bio,
        token
      }

      res.json({ user })

    } catch (error) {
      next(error)
    }
  }
];

// 3. 로그인 로직
exports.login = [
  // 11.
  isValidEmail().custom(doesEmailExists), // 이메일 검사
  isValidPassword().custom(doesPasswordMatch),  // 비밀번호 검사 
  async (req, res, next) => {
    try {
      const errors = validationResult(req); // 유효선 검사 결과

      if (!errors.isEmpty()) {
        const err = new Error();
        err.errors = errors.array();
        err.status = 401; // 401 Unauthorized (인증 실패)
        throw err;
      }

      const { email } = req.body;

      const _user = await User.findOne({ email });

      const token = _user.generateJWT(); // 로그인 토큰을 생성한다

      const user = {
        avatar: _user.avatar,
        username: _user.username,
        email: _user.email,
        fullName: _user.fullName,
        bio: _user.bio,
        token
      }

      res.json({ user }) // 클라이언트에게 데이터 전송

    } catch (error) {
      next(error) // 에러 핸들러에 전달
    }
  }
];
