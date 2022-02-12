
module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 0. 테스트 API
    app.get('/app/test', user.getTest);

    // 1. 카카오 로그인 API
    app.get('app/users/login/kakao', user.loginKakao);

    // 2. 네이버 로그인 API
    app.get('/app/users/login/naver', user.loginNaver);

    // 3. 로그인 API
    app.post('/app/users/login', user.login);

    // 4. 유저 생성 (회원가입) API
    app.post('/app/users', user.postUsers);

    // 5. 회원 정보 수정 API
    app.patch('/app/users/:userIdx', jwtMiddleware, user.patchUsers);

    // 6. 특정 유저 조회 API
    app.get('/app/users/:userIdx', jwtMiddleware, user.getUserById);

    // 7. 탈퇴하기 API
    app.patch('/app/users/:userIdx/status', jwtMiddleware, user.patchUsersStatus);

    // 9. 받은 일기 알림 설정
    app.patch('/app/users/:userIdx/push/diary', jwtMiddleware, user.patchDiaryPush);

    // 10. 받은 답장 알림 설정
    app.patch('/app/users/:userIdx/push/answer', jwtMiddleware, user.patchPushAnswer);

    // 11. 받은 채팅 알림 설정
    app.patch('/app/users/:userIdx/push/chat',jwtMiddleware,  user.patchPushChat);

    // 25. 유저 프로필 사진 업로드(수정)
    app.patch('/app/users/:userIdx/profile', jwtMiddleware, user.patchProfImg);

};