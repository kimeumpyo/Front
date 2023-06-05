// 샘플 데이터를 생성하는 파일

const userArgs = process.argv.slice(2);
// 데이터베이스와 연결시켜주는 모듈
const mongoose = require("mongoose");

const User = require('./models/User');
const Article = require('./models/Article');

// 잘못된 mongodb 주소를 전달했을 경우
if (!userArgs[0].startsWith('mongodb')) {
  console.log("ERROR: You need to specify a valid mongodb URL");
  return;
}

seedDatabase();

// 샘플 데이터를 생성하는 함수
async function seedDatabase() {
  try {
    const MONGODB_URI = userArgs[0];
    await mongoose.connect(MONGODB_URI);  // 데이터베이스 연결

    const users = [
      // users 생성할 유저 객체들
      {
        username: 'cat',
        email: 'cat@example.com',
        fullName: 'Kitty',
        avatar: 'cat.jpeg',
        bio: 'Meow',
      },
      {
        username: 'dog',
        email: 'dot@example.com',
        fullName: 'Mr.Loyal',
        avatar: 'dog.jpeg',
        bio: 'Bark',
      },
      {
        username: 'bird',
        email: 'bird@example.com',
        fullName: 'Blue and White',
        avatar: 'bird.jpeg',
        bio: '',
      }
    ]

    // 유저 객체를 생성한다
    for (let i = 0; i < users.length; i++) {
      const user = new User(); // User의 인스턴스를 생성한다

      user.username = users[i].username;
      user.email = users[i].email;
      user.fullName = users[i].fullName;
      user.avatar = users[i].avatar;
      user.bio = users[i].bio;

      await user.save(); // 데이터베이스에 저장한다

      console.log(user);
    }

    // cat의 게시물 생성
    for (let i = 1; i <= 4; i++) {
      const user = await User.findOne({ username: "cat" });

      const article = new Article();  // Article의 인스턴스를 생성한다
      article.photos = [`${i}.jpeg`];
      article.descroption = `cat photos ${i}`;
      article.author = user._id;

      await article.save(); // 데이터 베이스에 저장한다

      console.log(article);
    }

    mongoose.connection.close() // 데이터베이스 연결 종료

  } catch (error) {
    console.log(error);
  }
};