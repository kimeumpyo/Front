// 1. 패키지를 가져온다

    // 서버개발 프레임워크
    const express = require("express"); 
    // 404에러를 처리한다
    const createError = require("http-errors"); 
    // 클라이언트가 전송한 쿠키를 수집한다
    const cookieParser = require("cookie-parser"); 
    // 기록을 콘솔에 출력하고 저장한다
    const logger = require("morgan"); 
    // 서버에서 서버로 요청할 수 있게 한다(리소스 공유)
    const cors = require("cors"); 
    // 라우터
    const indexRouter = require("./routes/index"); 
    const app = express();
    // 앱(api 서버)과 mongoDB를 연결한다
    const mongoose = require("mongoose"); 
    // 압축기능 제공
    const compression = require("compression"); 
    // HTTP 요청 헤더를 위한 보안기능을 제공한다
    const helmet = require("helmet"); 
    // 환경변수를 사용할 수 있는 환경을 제공한다
    require("dotenv").config(); 

// 2. 데이터베니스 연결
    mongoose.set("strictQuery", false);
    mongoose
        .connect(process.env.MONGODB_URI) // env환경변수를 저장하는 파일
        .catch(err => console.error(err));

// 3. 미들웨어
    app.use(logger("dev")); // 기록저장
    app.use(express.json());
    app.use(express.urlencoded({ extended: false })); // 인코딩 디코딩?
    app.use(cookieParser()); // 쿠키 읽기/쓰기
    app.use(helmet.crossOriginResourcePolicy({
        policy: "cross-origin"
    }))
    app.use(compression()); // 압축
    app.use(cors());

// 4. 정적 경로 (파일 저장 경로)설정
    app.use("/api/static", express.static("public"));
    app.use("/api/files", express.static("files"));

// 5. 라우터 prefix 설정
    app.use("/api", indexRouter);

// 6. 404 에러 처리
    app.use((req, res, next)=>{
        next(createError(404));
    })

// 7. 에러 핸들러 (api에러는 전부 여기로 모인다)
    app.use((err, req, res, next)=>{
        console.error(err);
        res.status(err.status || 500).json(err);
    })

    module.exports = app;
