const jwtMiddleware = require("../../../config/jwtMiddleware");
const chatProvider = require("../../app/Chat/chatProvider");
const chatService = require("../../app/Chat/chatService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
//const fcmAccount = require("../../../gonggangam-f2086-firebase-adminsdk-hw07b-8a893cb50f.json");
const fcmAccount = require("../../../config/test-a9c79-firebase-adminsdk-t1wyq-b50493c592.json");
const admin = require('firebase-admin');
// admin.initializeApp({
//     credential: admin.credential.cert(fcmAccount),
//     databaseURL: "https://gonggangam-f2086-default-rtdb.firebaseio.com"
// });

/**
 * API No. 27
 * API Name : 채팅 시작하기 API
 * [POST] /app/chat
 */
exports.postChatUsers = async function (req, res) {

    /**
     * Body: content, diaryIdx
     */

    const {chatUserIdx} = req.body;

    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx);

    // 존재하는 유저인지 확인
    const userCheckResult = await chatProvider.checkUser(chatUserIdx);
    if (userCheckResult.length<1) return res.send(errResponse(baseResponse.USER_NOT_EXIST));
    // 이미 추가한 유저인지 확인
    const userValidCheck = await chatProvider.checkUserChatValid(userIdx, chatUserIdx);
    if (userValidCheck.length>0) return res.send(errResponse(baseResponse.CHAT_USER_INVALID));


    const postChatResponse = await chatService.createChatUser(userIdx, chatUserIdx);

    // admin.initializeApp({
    //     credential: admin.credential.cert(fcmAccount),
    //     databaseURL: "https://gonggangam-f2086-default-rtdb.firebaseio.com"
    // });
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(fcmAccount),
            databaseURL: "https://gonggangam-f2086-default-rtdb.firebaseio.com"
        });
    }

    // chatUserIdx에 채팅 시작했다는 알림 추가.
    const chatUserToken = await chatProvider.getChatUserToken(chatUserIdx);

    //let deviceToken = "fHmdTyvtSy63ZLZ0zrbopX:APA91bHtJef5XGXLV1TaGSvcrPu5v_1on_ogaDeGd3kSpDwfhB2es69GHbO-etQNnhVUjpiqf_KHYhpCHQbDzOugLrjb1v3jeKGCCLYr8dhTsHjYoo87lyjxPIQm0EhybIdeZ0mF-3TR"
    console.log(chatUserToken);

    let message = {
        notification: {
            title: '',
            body: '채팅이 시작되었어요!',
        },
        token: chatUserToken,

    }

    admin
        .messaging()
        .send(message)
        .then(function(fcmres){
            console.log('Successfully sent message:', fcmres);
            return res.send(postChatResponse);
            //return res.send(response(baseResponse.SUCCESS));
        })
        .catch(function(err) {
            console.log('Error Sending message!!! : ', err)
            //return res.send(errResponse(baseResponse.USER_PUSH_ERROR));
        });

    return res.send(postChatResponse);

};

/**
 * API No. 14
 * API Name : 받은 일기 조회 API
 * [GET] /app/chat
 */
exports.getChatList = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx)

    const chatResult = await chatProvider.retrieveChatList(userIdx);
    return res.send(response(baseResponse.SUCCESS, chatResult));

};