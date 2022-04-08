




# 당신의 마음 속 작은 창문 “공간감”




![mainMockup](https://user-images.githubusercontent.com/89574881/157797445-0a035fda-127e-46f5-bc74-595328f98e6a.jpeg)

> **공간감**은 익명의 사람과 나의 다이어리 한 페이지를 공유하고 서로 소통할 수 있는 1:1 다이어리 랜덤 공유 서비스입니다.
> 

# API Sheet


<img width="626" alt="Screen Shot 2022-03-11 at 12 43 27 PM" src="https://user-images.githubusercontent.com/80459739/157798827-3002dda5-ce3d-48f1-86ac-475105c513f3.jpeg">


# ERD

<img width="438" alt="Screen Shot 2022-03-11 at 12 38 55 PM" src="https://user-images.githubusercontent.com/80459739/162481886-5eafdec3-f414-416e-9d1e-e0ae4108c37c.png">

# Tech Stack

| Server | AWS EC2 |
| --- | --- |
| DB | AWS RDS |
| File DB | AWS S3 |
| Other Tools | Notion, Slack |

```json
{
  "name": "api-server-node",
  "version": "1.0.0",
  "description": "Node.js API Server",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "NODE_ENV=development node index.js",
    "prod": "NODE_ENV=production node index.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "aws-sdk": "^2.1064.0",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "crypto": "^1.0.1",
    "date-utils": "^1.2.21",
    "express": "^4.17.1",
    "express-fileupload": "^1.2.1",
    "firebase": "^9.6.6",
    "firebase-admin": "^10.0.2",
    "formidable": "^2.0.1",
    "jsonwebtoken": "^8.5.1",
    "method-override": "^3.0.0",
    "multer": "^1.4.4",
    "mysql": "^2.18.1",
    "mysql2": "^2.0.0",
    "nodemon": "^2.0.7",
    "pm2": "^5.1.2",
    "regex-email": "^1.0.2",
    "request": "^2.88.2",
    "winston": "^3.2.1",
    "winston-daily-rotate-file": "^4.2.1"
  }
}
```

# Foldering

```markdown
'|-- app',
  '    |-- .gitignore',
  '    |-- index.js',
  '    |-- package-lock.json',
  '    |-- package.json',
  '    |-- config',
  '    |   |-- baseResponseStatus.js',
  '    |   |-- database.js',
  '    |   |-- express.js',
  '    |   |-- firebase.js',
  '    |   |-- jwtMiddleware.js',
  '    |   |-- kakao.js',
  '    |   |-- naver.js',
  '    |   |-- response.js',
  '    |   |-- s3.js',
  '    |   |-- secret.js',
  '    |   |-- winston.js',
  '    |   |-- log',
  '    |       |-- .6c1a1f7b9023a40cab0375214d702bb453b1bc33-audit.json',
  '    |       |-- 2022-01-17-smart-push.log',
  '    |       |-- 2022-01-20-smart-push.log',
  '    |-- log',
  '    |   |-- .6c1a1f7b9023a40cab0375214d702bb453b1bc33-audit.json',
  '    |   |-- 2022-03-07-smart-push.log',
  '    |-- src',
  '        |-- .idea',
  '        |   |-- .gitignore',
  '        |   |-- misc.xml',
  '        |   |-- modules.xml',
  '        |   |-- runConfigurations.xml',
  '        |   |-- src.iml',
  '        |   |-- vcs.xml',
  '        |-- app',
  '            |-- Admin',
  '            |   |-- adminController.js',
  '            |   |-- adminDao.js',
  '            |   |-- adminProvider.js',
  '            |   |-- adminRoute.js',
  '            |   |-- adminService.js',
  '            |-- Diary',
  '            |   |-- diaryController.js',
  '            |   |-- diaryDao.js',
  '            |   |-- diaryProvider.js',
  '            |   |-- diaryRoute.js',
  '            |   |-- diaryService.js',
  '            |-- User',
  '                |-- userController.js',
  '                |-- userDao.js',
  '                |-- userProvider.js',
  '                |-- userRoute.js',
  '                |-- userService.js',
```
