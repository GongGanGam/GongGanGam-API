const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const yearNow = require("date-utils");
const regexEmail = require("regex-email");
const s3Client = require("../../../config/s3");
const naver = require("../../../config/naver");
//const kakao = require("../../../config/kakao");

const AWS = require('aws-sdk');

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

    var code = req.query.code;
    const client_id = kakao.client_id;
    const client_secret = kakao.client_secret;
    console.log('code: '+code);

    let api_url = 'https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id='
        + client_id + '&redirect_uri=http://3.36.219.12:3000/app/users/login/kakao&code='+code
        +'&client_secret='+client_secret;
    var request = require('request');
    var options = {
        url: api_url,
        headers: {
            'Content-Type':'application/x-www-form-urlencoded;'
        },
        /*body : {
            'grant_type' : 'authorization_code',
            'client_id' : client_id,
            'redirect_uri' : 'http://3.34.199.201:3000/app/users/login/kakao',
            'code' : code,
            'client_secret' : client_secret
        }*/
    };
    console.log('aaaaaa');
    request.post(options, function (error, resp, body) {
        if (!error) {
            console.log(body);
            console.log('success token');
            const obj = JSON.parse(body);
            var token = obj.access_token;
            var header = 'Bearer ' + token; // Bearer 다음에 공백 추가
            console.log('token ' + token);

            var api_url = 'https://kapi.kakao.com/v2/user/me';
            var request2 = require('request');
            console.log(body);

            var options = {
                url: api_url,
                headers: {'Authorization': header},
            };
            request2.get(options, async function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log('success me');
                    const myInfo = JSON.parse(body);
                    console.log(myInfo)
                    const email = myInfo.kakao_account.email;
                    const identification = myInfo.id;
                    console.log(email);
                    console.log('id: ' + identification)

                    // DB에 유저 있는지 확인 후, 없으면 로그인 처리
                    const userExist = await userProvider.checkUserExist(email, identification);
                    console.log(userExist)
                    if (userExist.length>0) {
                        const signInResponse = await userService.postKaKaoLogin(identification);
                        return res.send(signInResponse);
                    }
                    // 회원가입하게 받은 정보 리턴해주기.
                    else {
                        let nickname='', birthYear='', gender='';
                        if (myInfo.name) nickname = myInfo.name;
                        if (myInfo.gender) gender = myInfo.gender;
                        if (myInfo.birthYear) birthYear = myInfo.birthYear;

                        const result = {'nickname' : nickname, 'birthYear' : birthYear, 'gender' : gender, 'type' : 'kakao',
                            'email' : email, 'identification' : identification}

                        return res.json({
                            isSuccess: false,
                            code     : 5028,
                            message  : "로그인 실패. 회원가입해주세요",
                            result   : result
                        });
                    }

                } else {
                    console.log('error');
                    if(response != null) {
                        //res.status(response.statusCode).end();
                        console.log('me error = ' + response.statusCode);
                        return res.send(errResponse(baseResponse.LOGIN_KAKAO_TOKEN_ERROR));
                    }
                    return res.send(errResponse(baseResponse.LOGIN_KAKAO_ERROR));
                }
            });
        } else {

            console.log('token error = ' + response.statusCode);
            return res.send(errResponse(baseResponse.LOGIN_KAKAO_TOKEN_ERROR));

        }
    });
}


/**
 * API No. 2
 * API Name : 네이버 로그인 API
 * [POST] /app/users/login/naver
 *
 */
exports.loginNaver = async function (req, res) {

    const { token } = req.body;
    var header = "bearer " + token; // Bearer 다음에 공백 추가
    console.log('token ' + token);

    var api_url = 'https://openapi.naver.com/v1/nid/me';
    var request2 = require('request');
    //console.log(body);

    var options = {
        url: api_url,
        headers: {'Authorization': header}
    };
    request2.get(options, async function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('success me');
            const myInfo = JSON.parse(body);
            console.log(myInfo.response)
            const email = myInfo.response.email;
            const identification = myInfo.response.id;
            console.log(email);
            console.log('id: ' + identification)


            // DB에 유저 있는지 확인 후, 없으면 로그인 처리
            const userByIden = await userProvider.checkUserExistByIden(identification);
            console.log(userByIden)
            if (userByIden.length>0) {
                const signInResponse = await userService.postNaverLogin(identification);
                return res.send(signInResponse);
            }
            // 회원가입처리.
            else {
                const signinResponse = await userService.createUser("nickname", 2000, "N", "naver", email, identification);

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
                console.log('me error = ' + response.statusCode);
                return res.send(baseResponse.LOGIN_NAVER_TOKEN_ERROR);
            }
            return res.send(baseResponse.LOGIN_NAVER_ERROR);
        }
    });
}


/**
 * API No. 3
 * API Name : 로그인 API
 * [POST] /app/users/login
 * body : email, identification
 */
exports.login = async function (req, res) {

    const { email, identification } = req.body;

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
    console.log(userIdFromJWT)

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
    if (userIdFromJWT != userIdx) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

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
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
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
        s3.upload(params, async function(err, data) {
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