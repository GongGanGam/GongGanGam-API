const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const yearNow = require("date-utils");
const regexEmail = require("regex-email");
const s3Client = require("../../../config/s3");
const naver = require("../../../config/naver");
const kakao = require("../../../config/kakao");
//const fcmAccount = require("../../../gonggangam-f2086-firebase-adminsdk-hw07b-48074bd51f");
const fcmAccount = require("../../../config/test-a9c79-firebase-adminsdk-t1wyq-b50493c592.json");
const admin = require('firebase-admin');
const AWS = require('aws-sdk');
const axios = require('axios');
// admin.initializeApp({
//     credential: admin.credential.cert(fcmAccount),
//     databaseURL: "https://gonggangam-f2086-default-rtdb.firebaseio.com"
// });

/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
exports.getTest = async function (req, res) {
    return res.send(response(baseResponse.SUCCESS))
}
//참고사이트 : https://zionh.tistory.com/40
/**
 * API No. 1
 * API Name : 카카오 로그인 API
 * [POST] /app/users/login/kakao
 *
 */
exports.loginKakao = async function (req, res) {

    const { token, deviceToken } = req.body;

    var header = 'Bearer ' + token; // Bearer 다음에 공백 추가
    console.log('token ' + token);

    var api_url = 'https://kapi.kakao.com/v2/user/me';

    const axiosResult = await axios({
        url: api_url,
        method: 'get',
        headers: {'Authorization': header}
    })

    try {
        if (axiosResult.statusCode === 200) {
            const userData = axiosResult.kakao_account;
            console.log(userData);
            const email = userData.email;
            const identification = userData.id;

            console.log('id: ' + identification + ' email ' + email)

            // DB에 유저 있는지 확인 후, 없으면 로그인 처리
            const userExist = await userProvider.checkUserExist(email, identification);
            console.log(userExist)
            if (userExist.length > 0) {
                const signInResponse = await userService.postKaKaoLogin(identification);

                const userIdx = signInResponse.result.userIdx;
                console.log(userIdx);

                // 기기 토큰값 입력 (수정하기)
                const patchDeviceToken = await userService.patchDeviceToken(userIdx, deviceToken);
                if (patchDeviceToken !== 1) return res.send(patchDeviceToken);
                return res.send(signInResponse);
            }

            else {
                const signinResponse = await userService.createUser("nickname", 2000, "N", "kakao", email, identification);

                return res.json({
                    isSuccess: false,
                    code: 5028,
                    message: "로그인 실패. 회원가입해주세요",
                    result: signinResponse
                });

            }
        }
        else{
            console.log('error');
            const error = axiosResult.response;
            console.log(error);
            //console.log(error.msg);
            //res.status(response.statusCode).end();
            console.log('me error = ' + axiosResult);
            return res.send(errResponse(baseResponse.LOGIN_KAKAO_TOKEN_ERROR));

            //return res.send(errResponse(baseResponse.LOGIN_KAKAO_ERROR));
        }
    } catch (e) {
        console.log('error');
        const error = e.response;
        console.log(error);
        //console.log(error.msg);
        //res.status(response.statusCode).end();
        console.log('me error = ' + e);
        return res.send(errResponse(baseResponse.LOGIN_KAKAO_TOKEN_ERROR));
    }
    // if (axiosResult.statusCode === 200) {
    //     const userData = axiosResult.kakao_account;
    //     console.log(userData);
    //     const email = userData.email;
    //     const identification = userData.id;
    //
    //     console.log('id: ' + identification + ' email ' + email)
    //
    //     // DB에 유저 있는지 확인 후, 없으면 로그인 처리
    //     const userExist = await userProvider.checkUserExist(email, identification);
    //     console.log(userExist)
    //     if (userExist.length > 0) {
    //         const signInResponse = await userService.postKaKaoLogin(identification);
    //
    //         const userIdx = signInResponse.result.userIdx;
    //         console.log(userIdx);
    //
    //         // 기기 토큰값 입력 (수정하기)
    //         const patchDeviceToken = await userService.patchDeviceToken(userIdx, deviceToken);
    //         if (patchDeviceToken !== 1) return res.send(patchDeviceToken);
    //         return res.send(signInResponse);
    //     }
    //
    //     else {
    //         const signinResponse = await userService.createUser("nickname", 2000, "N", "kakao", email, identification);
    //
    //         return res.json({
    //             isSuccess: false,
    //             code: 5028,
    //             message: "로그인 실패. 회원가입해주세요",
    //             result: signinResponse
    //         });
    //
    //     }
    // }
    // else{
    //     console.log('error');
    //     const error = axiosResult.response;
    //     console.log(error);
    //     //console.log(error.msg);
    //     //res.status(response.statusCode).end();
    //     console.log('me error = ' + axiosResult);
    //     return res.send(errResponse(baseResponse.LOGIN_KAKAO_TOKEN_ERROR));
    //
    //     //return res.send(errResponse(baseResponse.LOGIN_KAKAO_ERROR));
    // }

}


/**
 * API No. 2
 * API Name : 네이버 로그인 API
 * [POST] /app/users/login/naver
 *
 */
exports.loginNaver = async function (req, res) {

    const {token, deviceToken} = req.body;

    var header = "bearer " + token; // Bearer 다음에 공백 추가
    console.log('token ' + token);

    var api_url = 'https://openapi.naver.com/v1/nid/me';
    //var request2 = require('request');

    if (!deviceToken) return res.send(response(baseResponse.LOGIN_DEVICETOKEN_EMPTY));

    const axiosResult = await axios({
        url: api_url,
        method: 'get',
        headers: {'Authorization': header}
    });
    console.log(axiosResult)

    try {
        if (axiosResult.status === 200) {
            const userData = axiosResult.data.response;
            const email = userData.email;
            const identification = userData.id;

            console.log('id: ' + identification + ' email ' + email)

            // DB에 유저 있는지 확인 후, 있으면 로그인 처리
            const userByIden = await userProvider.checkUserExistByIden(identification);
            console.log(userByIden)
            if (userByIden.length > 0) {
                const signInResponse = await userService.postNaverLogin(identification);

                const userIdx = signInResponse.result.userIdx;
                console.log(userIdx);

                // 기기 토큰값 입력 (수정하기)
                const patchDeviceToken = await userService.patchDeviceToken(userIdx, deviceToken);
                if (patchDeviceToken !== 1) return res.send(patchDeviceToken);

                return res.send(signInResponse);
            }
            else {
                const signinResponse = await userService.createUser("nickname", 2000, "N", "naver", email, identification);

                //const signinResponse = userService.createUser("nickname", 2000, "N", "naver", email, identification);
                console.log('signinres ='+ signinResponse)

                return res.json({
                    isSuccess: false,
                    code     : 5028,
                    message  : "로그인 실패. 회원가입해주세요",
                    result   : signinResponse
                });
            }
        } else {
            console.log('error');
            if(response != null) {
                //res.status(response.statusCode).end();
                console.log('me error = ' + axiosResult);
                console.log(axiosResult.code);
                console.log(axiosResult.msg);
                return res.send(baseResponse.LOGIN_NAVER_TOKEN_ERROR);
            }
            else {
                return res.send(baseResponse.LOGIN_NAVER_ERROR);
            }

        }
    } catch (e) {
        console.log('error');

            //res.status(response.statusCode).end();
        console.log('me error = ' + e);
        console.log(e.code);
        console.log(e.msg);
        return res.send(baseResponse.LOGIN_NAVER_TOKEN_ERROR);

    }
    // if (axiosResult.status === 200) {
    //     const userData = axiosResult.data.response;
    //     const email = userData.email;
    //     const identification = userData.id;
    //
    //     console.log('id: ' + identification + ' email ' + email)
    //
    //     // DB에 유저 있는지 확인 후, 있으면 로그인 처리
    //     const userByIden = await userProvider.checkUserExistByIden(identification);
    //     console.log(userByIden)
    //     if (userByIden.length > 0) {
    //         const signInResponse = await userService.postNaverLogin(identification);
    //
    //         const userIdx = signInResponse.result.userIdx;
    //         console.log(userIdx);
    //
    //         // 기기 토큰값 입력 (수정하기)
    //         const patchDeviceToken = await userService.patchDeviceToken(userIdx, deviceToken);
    //         if (patchDeviceToken !== 1) return res.send(patchDeviceToken);
    //
    //         return res.send(signInResponse);
    //     }
    //     else {
    //         const signinResponse = await userService.createUser("nickname", 2000, "N", "naver", email, identification);
    //
    //         //const signinResponse = userService.createUser("nickname", 2000, "N", "naver", email, identification);
    //         console.log('signinres ='+ signinResponse)
    //
    //         return res.json({
    //             isSuccess: false,
    //             code     : 5028,
    //             message  : "로그인 실패. 회원가입해주세요",
    //             result   : signinResponse
    //         });
    //     }
    // } else {
    //     console.log('error');
    //     if(response != null) {
    //         //res.status(response.statusCode).end();
    //         console.log('me error = ' + axiosResult);
    //         console.log(axiosResult.code);
    //         console.log(axiosResult.msg);
    //         return res.send(baseResponse.LOGIN_NAVER_TOKEN_ERROR);
    //     }
    //     else {
    //         return res.send(baseResponse.LOGIN_NAVER_ERROR);
    //     }
    //
    // }

}


    /**
     * API No. 3
     * API Name : 로그인 API
     * [POST] /app/users/login
     * body : email, identification
     */
    exports.login = async function (req, res) {

        const {email, identification} = req.body;

        const signInResponse = await userService.postSignIn(email, identification);

        return res.send(signInResponse);
    }


    /**
     * API No. 4
     * API Name : 추가 정보 입력 API
     * [POST] /app/users/signin
     *body: nickname, birthYear, gender
     */
    exports.postUsers = async function (req, res) {

        const userIdFromJWT = req.verifiedToken.userIdx;
        const {nickname, birthYear, gender} = req.body;
        console.log('Signin Update'+userIdFromJWT)

        // 빈 값 체크
        if (!nickname) return res.send(response(baseResponse.SIGNIN_USER_NICKNAME_EMPTY));
        if (!birthYear) return res.send(response(baseResponse.USER_BIRTHYEAR_EMPTY));
        if (!gender) return res.send(response(baseResponse.USER_GENDER_EMPTY));

        //길이 체크
        if (nickname.length > 20) return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));

        // 유저 정보 입력
        const signUpResponse = await userService.updateUserInfo(
            nickname,
            birthYear,
            gender, userIdFromJWT
        );

        // signUpResponse 값을 json으로 전달
        return res.send(signUpResponse);
    };


    /**
     * API No. 5
     * API Name : 회원 정보 수정 API + JWT + Validation
     * [PATCH] /app/users/:userIdx
     * path variable : userIdx
     * body : nickname, birthYear, gender, setAge
     */
    exports.patchUsers = async function (req, res) {

        const userIdFromJWT = req.verifiedToken.userIdx;

        const userIdx = req.params.userIdx;
        const {nickname, birthYear, gender, setAge} = req.body;
        const today = new Date();
        console.log(userIdx)
        console.log(userIdFromJWT)
        if (userIdFromJWT !== userIdx) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

        // 빈 값 체크
        if (!nickname) return res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));
        if (nickname.length > 20) return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));
        if (!birthYear) return res.send(response(baseResponse.USER_BIRTHYEAR_EMPTY));
        if (!gender) return res.send(response(baseResponse.USER_GENDER_EMPTY));
        if (!setAge) return res.send(response(baseResponse.USER_SETAGE_EMPTY));

        //1900~올해까지만 유저 생성
        let year = Number(birthYear);
        if (year <= 1900 || year >= today.getFullYear()) return res.send(errResponse(baseResponse.USER_BIRTHYEAR_TIME_WRONG));
        if (!(gender === 'M' || gender === 'F' || gender === 'N')) return res.send(errResponse(baseResponse.USER_GENDER_WRONG));
        if (!(setAge === 'T' || setAge === 'F')) return res.send(errResponse(baseResponse.USER_SETAGE_WRONG));

        const editUserInfo = await userService.editUser(nickname, birthYear, gender, setAge, userIdx);
        return res.send(editUserInfo);

    };


    /**
     * API No. 6
     * API Name : 특정 유저 조회 API
     * [GET] /app/users/:userIdx
     * Path Variable: userIdx
     */
    exports.getUserById = async function (req, res) {

        const userIdFromJWT = req.verifiedToken.userIdx;

        const userIdx = req.params.userIdx;

        if (userIdFromJWT != userIdx) {
            return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
        } else {
            const userByUserIdx = await userProvider.userIdCheck(userIdx);
            return res.send(response(baseResponse.SUCCESS, userByUserIdx[0]));
        }
    };


    /**
     * API No. 7
     * API Name : 탈퇴하기 API
     * [PATCH] /app/users/:userIdx/status
     * Path Variable : userIdx, status
     */
    exports.patchUsersStatus = async function (req, res) {

        const userIdFromJWT = req.verifiedToken.userIdx;

        const userIdx = req.params.userIdx;

        if (userIdFromJWT != userIdx) {
            res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
        } else {
            const editUserStatus = await userService.editUserStatus(userIdx);
            return res.send(editUserStatus);
        }

    };

    /**
     * API No. 9
     * API Name : 받은 일기 알림 설정
     * [PATCH] /app/users/:userIdx/push/diary
     * path variable : userIdx, diary
     * body : diaryPush
     */
    exports.patchDiaryPush = async function (req, res) {

        const userIdFromJWT = req.verifiedToken.userIdx;

        const userIdx = req.params.userIdx;
        const diaryPush = req.body.diaryPush;

        if (userIdFromJWT != userIdx) {
            res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
        } else {
            if (!diaryPush) return res.send(errResponse(baseResponse.USER_DIARY_PUSH_EMPTY));
            if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
            if (!(diaryPush == 'T' || diaryPush == 'F')) return res.send(errResponse(baseResponse.PUSH_DIARY_WRONG));

            const editDiaryPush = await userService.editDiaryPush(userIdx, diaryPush);
            return res.send(editDiaryPush);
        }
    };

    /** API No. 10
     * API Name : 받은 답장 알림 설정
     * [PATCH] /app/users/:userIdx/push/answer
     * path variable : userIdx, answer
     * body : diaryPush
     */
    exports.patchPushAnswer = async function (req, res) {

        const userIdFromJWT = req.verifiedToken.userIdx;

        const userIdx = req.params.userIdx;
        const answerPush = req.body.answerPush;

        if (userIdFromJWT != userIdx) {
            res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
        } else {
            if (!answerPush) return res.send(errResponse(baseResponse.USER_ANSWER_PUSH_EMPTY));
            if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
            if (!(answerPush == 'T' || answerPush == 'F')) return res.send(errResponse(baseResponse.PUSH_ANSWER_WRONG));

            const editAnswerPush = await userService.editAnswerPush(userIdx, answerPush);
            return res.send(editAnswerPush);
        }
    };

    /** API No. 11
     * API Name : 받은 채팅 알림 설정
     * [PATCH] /app/users/:userIdx/push/chat
     * path variable : userIdx, chat
     * body : chatPush
     */
    exports.patchPushChat = async function (req, res) {

        const userIdFromJWT = req.verifiedToken.userIdx;

        const userIdx = req.params.userIdx;
        const chatPush = req.body.chatPush;

        if (userIdFromJWT != userIdx) {
            res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
        } else {
            if (!chatPush) return res.send(errResponse(baseResponse.USER_CHAT_PUSH_EMPTY));
            if (!userIdx) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
            if (!(chatPush == 'T' || chatPush == 'F')) return res.send(errResponse(baseResponse.PUSH_CHAT_WRONG));

            const editChatPush = await userService.editChatPush(userIdx, chatPush);
            return res.send(editChatPush);
        }

    };

    /**
     * API No. 25
     * API Name : 유저 프로필 사진 업로드(수정) API
     * [PATCH] /app/users/:userIdx/profile
     */
    exports.patchProfImg = async function (req, res) {

        //const userIdx = 1;
        const userIdx = req.params.userIdx;
        const userIdFromJWT = req.verifiedToken.userIdx;

        console.log('userIdx: ' + userIdx)
        if (userIdFromJWT != userIdx) res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

        const file = req.files;
        console.log(file);


        if (!req.files) {
            console.log('no file');
            return res.send(errResponse(baseResponse.USER_PROFIMG_EMPTY));
        }
        // 파일 잇는 경우
        else {
            const img = req.files.profImg;
            console.log(img)
            let bucketName = 'gonggangam-bucket'

            const s3 = new AWS.S3({
                accessKeyId: s3Client.accessid,
                secretAccessKey: s3Client.secret,
                region: 'ap-northeast-2',
                Bucket: bucketName
            });

            const params = {
                Bucket: 'gonggangam-bucket',
                Key: img.name,
                Body: img.data
            };
            s3.upload(params, async function (err, data) {
                if (err) {
                    //throw err;
                    console.log('error')
                    console.log(err)
                    return res.send(errResponse(baseResponse.DIARY_S3_ERROR));
                } else {
                    console.log(`File uploaded successfully.`);
                    console.log(data.Location)
                    const updateResponse = await userService.updateUserImg(userIdx, data.Location);
                    return res.send(updateResponse);

                }
            });
        }
    };

    /**
     * API No.
     * API Name : 푸시 알림 테스트 API
     * [GET] /app/users/push/test
     */
    exports.getPush = async function (req, res) {
        let deviceToken = 'fHmdTyvtSy63ZLZ0zrbopX:APA91bHtJef5XGXLV1TaGSvcrPu5v_1on_ogaDeGd3kSpDwfhB2es69GHbO-etQNnhVUjpiqf_KHYhpCHQbDzOugLrjb1v3jeKGCCLYr8dhTsHjYoo87lyjxPIQm0EhybIdeZ0mF-3TR';
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(fcmAccount),
                databaseURL: "https://gonggangam-f2086-default-rtdb.firebaseio.com"
            });
        }

        let message = {
            notification: {
                title: '쑤이',
                body: '쏘사랑해><',
            },
            token: deviceToken,
        }

        admin
            .messaging()
            .send(message)
            .then(function (fcmres) {
                console.log('Successfully sent message:', fcmres)
                return res.send(response(baseResponse.SUCCESS));
            })
            .catch(function (err) {
                console.log('Error Sending message!!! : ', err)
                return res.send(errResponse(baseResponse.USER_PUSH_ERROR));
            });


}