const jwtMiddleware = require("../../../config/jwtMiddleware");
const diaryProvider = require("../../app/Diary/diaryProvider");
const diaryService = require("../../app/Diary/diaryService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const s3Client = require("../../../config/s3");
const AWS = require('aws-sdk');
const formidable = require('formidable')
const fs = require('fs');

const admin = require('firebase-admin');
const fcmAccount = require("../../../gonggangam-f2086-firebase-adminsdk-hw07b-66d59423da.json");
// const admin = require("firebase-admin");
//
// let serviceAccount = require("../../../config/firebase_admin.json");

/**
 * API No. 12
 * API Name : 받은 일기 리스트 조회 API
 * [GET] /app/diarys/share?page=
 */
exports.getSharedDiarys = async function (req, res) {

    //const userIdx = 1;
    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx)

// 페이징 처리 (테스트 용으로 페이지 사이즈 3)
    let page = req.query.page;
    if (!page) page = 1;
    console.log('page Num:' + page);
    const pageSize = 3;
    let pageNum = Number(page);
    const offset = pageSize * pageNum - pageSize;
    console.log('pageNum: ' + pageNum);
    console.log('offset: ' + offset);

    if (offset<0) return res.send(errResponse(baseResponse.PAGE_INVALID));

    const shareDiary = await diaryProvider.retrieveAllShared(userIdx);
    console.log(shareDiary);
    if (shareDiary.length < offset) return res.send(errResponse(baseResponse.PAGE_INVALID_END));
    const totalPage = Math.ceil(shareDiary.length/pageSize);
    console.log('totalPage: ' + totalPage);


    const sharedDiaryResult = await diaryProvider.retrieveSharedDiaryList(userIdx, pageSize, offset);

    const pageInfo = {"curPage" : parseInt(page), "totalPage" : totalPage, "pageSize" : pageSize};
    const result = {"page" : pageInfo, "diarys":sharedDiaryResult};
    return res.send(response(baseResponse.SUCCESS, result));

};

/**
 * API No. 13
 * API Name : 받은 답장 리스트 조회 API
 * [GET] /app/diarys/answer?page=
 */
exports.getAnswerList = async function (req, res) {
    //const userIdx = 1;
    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx)

    // 페이징 처리 (테스트 용으로 페이지 사이즈 3)
    let page = req.query.page;
    if (!page) page = 1;
    console.log('page Num:' + page);
    const pageSize = 3;
    let pageNum = Number(page);
    const offset = pageSize * pageNum - pageSize;
    console.log('pageNum: ' + pageNum);
    console.log('offset: ' + offset);

    if (offset<0) return res.send(errResponse(baseResponse.PAGE_INVALID));

    const answers = await diaryProvider.retrieveAllAnswer(userIdx);
    console.log(answers);
    console.log('length:' + answers.length);
    //페이지 끝났다는걸 표시해야할까..?
    if (answers.length < offset) return res.send(errResponse(baseResponse.PAGE_INVALID_END));
    const totalPage = Math.ceil(answers.length/pageSize);
    console.log('totalPage: ' + totalPage);

    const answerResult = await diaryProvider.retrieveAnswerList(userIdx, pageSize, offset);

    const pageInfo = {"curPage" : parseInt(page), "totalPage" : totalPage, "pageSize" : pageSize};
    const result = {"page" : pageInfo, "answers":answerResult};
    return res.send(response(baseResponse.SUCCESS, result));

};

/**
 * API No. 14
 * API Name : 받은 일기 조회 API
 * [GET] /app/diarys/share/:diaryIdx
 */
exports.getSharedDiaryDetail = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx)

    const diaryIdx = req.params.diaryIdx;

    if (!diaryIdx) return res.send(errResponse(baseResponse.DIARY_DIARYIDX_EMPTY));
    // 조회한 다이어리가 자기에게 온 공유인지 확인
    const checkDiaryShareUser = await diaryProvider.checkDiaryShareUser(diaryIdx, userIdx);
    if (checkDiaryShareUser.length<1) return res.send(errResponse(baseResponse.DIARYSHARE_USER_INVALID));

    const sharedDiaryResult = await diaryProvider.retrieveSharedDiary(diaryIdx);
    // 확인한 다이어리 업데이트
    const diaryCheckResult = await diaryService.updateDiaryIsRead(diaryIdx);
    if (diaryCheckResult !== 1) return res.send(diaryCheckResult);
    
    // 존재하지 않는 다이어리 확인
    if (sharedDiaryResult.length<1) return res.send(errResponse(baseResponse.DIARY_DIARYIDX_NOT_EXIST));
    return res.send(response(baseResponse.SUCCESS, sharedDiaryResult));

};

/**
 * API No. 15
 * API Name : 받은 답장 조회 API
 * [GET] /app/diarys/answer/:diaryIdx
 */
exports.getAnswer = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx)

    const answerIdx = req.params.answerIdx;
    //const userIdx = 1;

    if (!answerIdx) return res.send(errResponse(baseResponse.ANSWER_ANSWERIDX_EMPTY));
    // 존재하지 않는 유저인지 확인
    const userCheckResult = await diaryProvider.checkUser(userIdx);
    if (userCheckResult.length<1) return res.send(errResponse(baseResponse.USER_NOT_EXIST));
    // 존재하지 않는 답장인지 확인
    const answerCheckResult = await diaryProvider.checkAnswer(answerIdx);
    if (answerCheckResult.length<1) return res.send(errResponse(baseResponse.ANSWER_ANSWERIDX_NOT_EXIST));
    // 다이어리의 접근하는 유저인지 확인?
    if (answerCheckResult[0].answerUserIdx !== userIdx) return res.send(errResponse(baseResponse.ANSWER_USERIDX_INVALID));

    const answerResult = await diaryProvider.retrieveAnswerByIdx(answerIdx, userIdx);
    // 확인한 답장 업데이트
    const answerReadCheckResult = await diaryService.updateAnswerIsRead(answerIdx);
    if (answerReadCheckResult !== 1) return res.send(answerReadCheckResult);


    return res.send(response(baseResponse.SUCCESS, answerResult));

};

/**
 * API No. 16
 * API Name : 나의 다이어리 조회(캘린더 - 이모티콘) API
 * [GET] /app/diary?year=&month=
 */
exports.getDiarys = async function (req, res) {

    /**
     * Query String: year, month
     */
    const year = req.query.year;
    const month = req.query.month;
    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx);

    if (!year) return res.send(errResponse(baseResponse.DIARY_YEAR_EMPTY));
    if (!month) return res.send(errResponse(baseResponse.DIARY_MONTH_EMPTY));


    const monthDiaryResult = await diaryProvider.retrieveMonthList(userIdx, year, month);
    return res.send(response(baseResponse.SUCCESS, monthDiaryResult));

};


/**
 * API No. 17
 * API Name : 그날의 다이어리 조회 API
 * [GET] /app/diary/detail?year=&month=&day=
 */
exports.getDiaryDetail = async function (req, res) {

    /**
     * Query String: year, month, day
     */
    const year = req.query.year;
    const month = req.query.month;
    const day = req.query.day;
    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx)


    if (!year) return res.send(errResponse(baseResponse.DIARY_YEAR_EMPTY));
    if (!month) return res.send(errResponse(baseResponse.DIARY_MONTH_EMPTY));
    if (!day) return res.send(errResponse(baseResponse.DIARY_DAY_EMPTY));

    const diaryResult = await diaryProvider.retrieveDiary(userIdx, year, month, day);
    return res.send(response(baseResponse.SUCCESS, diaryResult));

};

/**
 * API No. 18
 * API Name : 다이어리 쓰기 &공유하기 API
 * [POST] /app/diarys
 */
exports.postDiary = async function (req, res) {

    /**
     * Body: emoji, date, content, shareAgree
     */

    const {emoji, year, month, day, content, shareAgree} = req.body;
    const file = req.files;
    console.log(file);

    //const userIdx = 1;
    const userIdx = req.verifiedToken.userIdx;

    // console.log('userIdx: ' + userIdx)
    // console.log(errResponse(baseResponse.DIARY_YEAR_EMPTY));
    // console.log(typeof(errResponse(baseResponse.DIARY_YEAR_EMPTY)));
    // console.log(errResponse(baseResponse.DIARY_YEAR_EMPTY)>=0)

    if (!year) return res.send(errResponse(baseResponse.DIARY_YEAR_EMPTY));
    if (!month) return res.send(errResponse(baseResponse.DIARY_MONTH_EMPTY));
    if (!day) return res.send(errResponse(baseResponse.DIARY_DAY_EMPTY));


    if (!(shareAgree === 'T' || shareAgree === 'F')) return res.send(errResponse(baseResponse.DIARY_SHAREAGREE_INVALID));

    let date = year;

    if (month < 10) {
        date = date + '-0' +month;
        if (day < 10) date = date + '-0' + day;
        else date = date + '-' + day;
    } else {
        date = date + '-' + month;
        if (day < 10) date = date + '-0' + day;
        else date = date + '-' + day;
    }
    console.log(date);

    admin.initializeApp({
        credential: admin.credential.cert(fcmAccount),
        databaseURL: "https://gonggangam-f2086-default-rtdb.firebaseio.com"
    });

    // 파일 없으면 파일 없이 그냥 업로드
    if (!req.files) {
        console.log('no file');
        const postdiaryResponse = await diaryService.createDiary(userIdx, date, emoji, content, shareAgree);
        console.log(postdiaryResponse)
        // 유저에게 푸시 알림 보내기 (FCM)
        // 보낼 유저의 deviceToken 가져오기
        // createDiary에서 random 유저 가져오는데 이거 어떻게 가져오징..
        if (postdiaryResponse>0) {
            const getDiaryUser = await diaryProvider.getTokenByUserIdx(userIdx);
            console.log(getDiaryUser[0].deviceToken)
            let deviceToken = getDiaryUser[0].deviceToken;
            console.log(deviceToken);

            // admin.initializeApp({
            //     credential: admin.credential.cert(fcmAccount),
            //     databaseURL: "https://gonggangam-f2086-default-rtdb.firebaseio.com"
            // });

            let message = {
                notification: {
                    title: '다이어리가 도착했어요!',
                    body: '',
                },
                token: deviceToken,
            }

            admin
                .messaging()
                .send(message)
                .then(function(fcmres){
                    console.log('Successfully sent message:', fcmres)
                    return res.send(response(baseResponse.SUCCESS));
                })
                .catch(function(err) {
                    console.log('Error Sending message!!! : ', err)
                    return res.send(errResponse(baseResponse.USER_PUSH_ERROR));
                });
            //return res.send(response(baseResponse.SUCCESS));
        }
        else if (postdiaryResponse===0) {
            return res.send(response(baseResponse.SUCCESS));
        }
        else {
            return res.send(postdiaryResponse);
        }
        //return res.send(postdiaryResponse);
    }
    // 파일 잇는 경우
    else {
        const img = req.files.uploadImg;
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
                const diaryResponse = await diaryService.createDiaryImg(userIdx, date, emoji, content, shareAgree, data.Location);
                console.log(diaryResponse)

                if (diaryResponse>0) {
                    const getDiaryUser = await diaryProvider.getTokenByUserIdx(userIdx);
                    console.log(getDiaryUser[0].deviceToken)
                    let deviceToken = getDiaryUser[0].deviceToken;
                    //let deviceToken = 'fHmdTyvtSy63ZLZ0zrbopX:APA91bHtJef5XGXLV1TaGSvcrPu5v_1on_ogaDeGd3kSpDwfhB2es69GHbO-etQNnhVUjpiqf_KHYhpCHQbDzOugLrjb1v3jeKGCCLYr8dhTsHjYoo87lyjxPIQm0EhybIdeZ0mF-3TR';

                    console.log(deviceToken);



                    let message = {
                        notification: {
                            title: '다이어리가 도착했어요!',
                            body: '',
                        },
                        token: deviceToken,
                    }

                    admin
                        .messaging()
                        .send(message)
                        .then(function(fcmres){
                            console.log('Successfully sent message:', fcmres)
                            return res.send(response(baseResponse.SUCCESS));
                        })
                        .catch(function(err) {
                            console.log('Error Sending message!!! : ', err)
                            return res.send(errResponse(baseResponse.USER_PUSH_ERROR));
                        });
                    //return res.send(response(baseResponse.SUCCESS));
                }
                else if (diaryResponse===0) {
                    return res.send(response(baseResponse.SUCCESS));
                }
                else {
                    return res.send(diaryResponse);
                }
                //return res.send(diaryResponse);
            }
        });
    }
};

/**
 * API No. 10
 * API Name : 다이어리 답장하기 API
 * [POST] /app/diarys/answer
 */
exports.postAnswer = async function (req, res) {

    /**
     * Body: content, diaryIdx
     */

    const {content, diaryIdx} = req.body;

    //const userIdx = 1;
    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx)

    const postAnswerResponse = await diaryService.createAnswer(userIdx, diaryIdx, content);

    // 해당 다이어리 쓴 사람의 deviceToken 가져오기
    const getDiaryUser = await diaryProvider.getDiaryUser(diaryIdx);
    console.log(getDiaryUser[0].deviceToken)
    let deviceToken = getDiaryUser[0].deviceToken;
    admin.initializeApp({
        credential: admin.credential.cert(fcmAccount),

    });

    let message = {
        notification: {
            title: '답장이 도착했어요!',
            body: '',
        },
        token: deviceToken,
    }

    admin
        .messaging()
        .send(message)
        .then(function(fcmres){
            console.log('Successfully sent message:', fcmres)
            //return res.send(response(baseResponse.SUCCESS));
        })
        .catch(function(err) {
            console.log('Error Sending message!!! : ', err)
            return res.send(errResponse(baseResponse.USER_PUSH_ERROR));
        });
    
    return res.send(postAnswerResponse);

};

/**
 * API No. 20
 * API Name : 다이어리 삭제하기 API
 * [POST] /app/diarys/:diaryIdx/status
 */
exports.patchDiaryStatus = async function (req, res) {

    /**
     * Body: emoji, date, content, shareAgree
     */

    const diaryIdx = req.params.diaryIdx;
    //const userIdx = 1;
    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx)

    const patchdiaryResponse = await diaryService.updateDiaryStatus(userIdx, diaryIdx);
    return res.send(patchdiaryResponse);

};


/**
 * API No. 22
 * API Name : 다이어리 수정하기 API
 * [POST] /app/diarys/:diaryIdx
 */
exports.patchDiary = async function (req, res) {

    /**
     * Body: emoji, date, content, shareAgree
     */

    const diaryIdx = req.params.diaryIdx;
    const {emoji, year, month, day, content, shareAgree} = req.body;
    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx)

    if (!year) return res.send(errResponse(baseResponse.DIARY_YEAR_EMPTY));
    if (!month) return res.send(errResponse(baseResponse.DIARY_MONTH_EMPTY));
    if (!day) return res.send(errResponse(baseResponse.DIARY_DAY_EMPTY));

    let date = year;

    if (month < 10) {
        date = date + '-0' +month;
        if (day < 10) date = date + '-0' + day;
        else date = date + '-' + day;
    } else {
        date = date + '-' + month;
        if (day < 10) date = date + '-0' + day;
        else date = date + '-' + day;
    }

    if (!(shareAgree === 'T' || shareAgree === 'F')) return res.send(errResponse(baseResponse.DIARY_SHAREAGREE_INVALID));

    const patchdiaryResponse = await diaryService.updateDiary(diaryIdx, userIdx, date, emoji, content, shareAgree);

    // shareAgree T면 랜덤 유저의 deviceToken 가져오기.
    let deviceToken = 'fHmdTyvtSy63ZLZ0zrbopX:APA91bHtJef5XGXLV1TaGSvcrPu5v_1on_ogaDeGd3kSpDwfhB2es69GHbO-etQNnhVUjpiqf_KHYhpCHQbDzOugLrjb1v3jeKGCCLYr8dhTsHjYoo87lyjxPIQm0EhybIdeZ0mF-3TR';
    admin.initializeApp({
        credential: admin.credential.cert(fcmAccount),

    });

    let message = {
        notification: {
            title: '다이어리가 도착했어요!',
            body: '',
        },
        token: deviceToken,
    }

    admin
        .messaging()
        .send(message)
        .then(function(fcmres){
            console.log('Successfully sent message:', fcmres)
            //return res.send(response(baseResponse.SUCCESS));
        })
        .catch(function(err) {
            console.log('Error Sending message!!! : ', err)
            return res.send(errResponse(baseResponse.USER_PUSH_ERROR));
        });
    return res.send(patchdiaryResponse);

};

/**
 * API No. 22
 * API Name : 답장 거절하기 API
 * [PATCH] /app/diarys/answer/:answerIdx
 */
exports.patchAnswerReject = async function (req, res) {

    const answerIdx = req.params.answerIdx;
    const userIdx = req.verifiedToken.userIdx;

    console.log('userIdx: ' + userIdx)

    if (!answerIdx) return res.send(errResponse(baseResponse.ANSWER_ANSWERIDX_EMPTY));

    const patchAnswerResponse = await diaryService.updateAnswerReject(userIdx, answerIdx);
    return res.send(patchAnswerResponse);

};

/**
 * API No.
 * API Name : 푸쉬 알림 테스트 API
 * [POST] /app/diarys/push
 */
// exports.postPush = async function (req, res) {
//
//     admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//         databaseURL: "https://gonggangam-default-rtdb.firebaseio.com"
//     });
//
//     const diaryIdx = req.params.diaryIdx;
//     //const userIdx = 1;
//     const userIdx = req.verifiedToken.userIdx;
//
//     console.log('userIdx: ' + userIdx)
//
//     let target_token = '';
//     let message = {
//         data: {
//             title: '테스트 데이터 발송',
//             body: '데이터가 잘 가나요?',
//             style: '굳굳',
//         },
//         token: target_token,
//     }
//     admin
//         .messaging()
//         .send(message)
//         .then(function (response) {
//             console.log('Successfully sent message: : ', response)
//         })
//         .catch(function (err) {
//             console.log('Error Sending message!!! : ', err)
//         })
//
//
//     return res.send(response(baseResponse.SUCCESS));
//
// };