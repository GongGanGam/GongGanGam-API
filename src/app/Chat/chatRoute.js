module.exports = function(app){
    const chat = require('./chatController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 27. 채팅 시작하기 API
    app.post('/app/chat', jwtMiddleware, chat.postChatUsers);

    // 28. 채팅방 리스트(채팅 유저 조회) API
    app.get('/app/chat', jwtMiddleware, chat.getChatList);
};

