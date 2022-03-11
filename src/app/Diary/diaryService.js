const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");

const diaryProvider = require("./diaryProvider");
const diaryDao = require("./diaryDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createDiary = async function (userIdx, date, emoji, content, shareAgree) {
    try {

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        const insertDiaryParams = [userIdx, date, emoji, content, shareAgree];
        console.log(insertDiaryParams);

        const connection = await pool.getConnection(async (conn) => conn);

        try {
            await connection.beginTransaction();

            const diaryResult = await diaryDao.insertDiary(connection, insertDiaryParams);
            const insertDiaryIdx = diaryResult[0].insertId;
            console.log('insert:' + insertDiaryIdx);

            if (shareAgree === 'T') {

                // 랜덤의 유저 가져오기
                const randUser = await diaryDao.selectRandUser(connection, userIdx);
                console.log(randUser[0].userIdx);
                const randUserIdx = randUser[0].userIdx;

                const shareParams = [insertDiaryIdx, randUserIdx];
                const shareResult = await diaryDao.insertShare(connection, shareParams);
            }

            await connection.commit();
            return response(baseResponse.SUCCESS);
        } catch (err) {
            console.log(err);
            await connection.rollback();
        } finally {
            connection.release();
        }

    } catch (err) {
        logger.error(`App - createDiary Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createDiaryImg = async function (userIdx, date, emoji, content, shareAgree, imgUrl) {
    try {

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        const insertDiaryParams = [userIdx, date, emoji, content, shareAgree, imgUrl];
        console.log(insertDiaryParams);

        const connection = await pool.getConnection(async (conn) => conn);


        try {
            await connection.beginTransaction();

            const diaryResult = await diaryDao.insertDiaryImg(connection, insertDiaryParams);
            const insertDiaryIdx = diaryResult[0].insertId;
            console.log('insert:' + insertDiaryIdx);

            if (shareAgree === 'T') {

                // 랜덤의 유저 가져오기
                const randUser = await diaryDao.selectRandUser(connection, userIdx);
                console.log(randUser[0].userIdx);
                const randUserIdx = randUser[0].userIdx;

                const shareParams = [insertDiaryIdx, randUserIdx];
                const shareResult = await diaryDao.insertShare(connection, shareParams);
            }

            await connection.commit();
            return response(baseResponse.SUCCESS);
        } catch (err) {
            console.log(err);
            await connection.rollback();
        } finally {
            connection.release();
        }

    } catch (err) {
        logger.error(`App - createDiary Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateDiaryStatus = async function (userIdx, diaryIdx) {
    try {

        const connection = await pool.getConnection(async (conn) => conn);

        // 존재하는 사용자, 다이어리인지 확인
        const userResult = await diaryDao.checkUserExists(connection, userIdx);
        if (userResult.length<1) return errResponse(baseResponse.USER_NOT_EXIST);
        const diaryResult = await diaryDao.checkDiaryExists(connection, diaryIdx);
        if (diaryResult.length<1) return errResponse(baseResponse.DIARY_DIARYIDX_NOT_EXIST);

        // 삭제할 권한 있는 사용자인지 확인
        if (diaryResult[0].userIdx !== userIdx) return errResponse(baseResponse.DIARY_USER_INVALID);


        const updateDiaryResult = await diaryDao.updateDiaryStatus(connection, diaryIdx);

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - updateDiaryStatus Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateDiaryIsRead = async function (diaryIdx) {
    try {

        const connection = await pool.getConnection(async (conn) => conn);

        const updateDiaryReadResult = await diaryDao.updateDiaryReadStatus(connection, diaryIdx);

        connection.release();
        return 1;

    } catch (err) {
        logger.error(`App - updateDiaryIsRead Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateDiary = async function (diaryIdx, userIdx, date, emoji, content, shareAgree) {
    try {

        const connection = await pool.getConnection(async (conn) => conn);

        // 존재하는 사용자, 다이어리인지 확인
        const userResult = await diaryDao.checkUserExists(connection, userIdx);
        if (userResult.length<1) return errResponse(baseResponse.USER_NOT_EXIST);
        const diaryResult = await diaryDao.checkDiaryExists(connection, diaryIdx);
        if (diaryResult.length<1) return errResponse(baseResponse.DIARY_DIARYIDX_NOT_EXIST);

        // 삭제할 권한 있는 사용자인지 확인
        if (diaryResult[0].userIdx !== userIdx) return errResponse(baseResponse.DIARY_USER_INVALID);

        // 이미 공유했으면 공유 수정은 안됨.
        const shareAgreeResult = await diaryDao.checkShareAgree(connection, diaryIdx);
        console.log(shareAgreeResult[0].shareAgree)

        if (shareAgreeResult[0].shareAgree == 'T') {
            if (shareAgree == 'F') return errResponse(baseResponse.DIARY_UPDATE_SHARE_INVALID);
        } else {
            if (shareAgree == 'T') {
                // 공유하기
                // 랜덤의 유저 가져오기
                const randUser = await diaryDao.selectRandUser(connection, userIdx);
                console.log(randUser[0].userIdx);
                const randUserIdx = randUser[0].userIdx;

                const shareParams = [diaryIdx, randUserIdx];
                const shareResult = await diaryDao.insertShare(connection, shareParams);
            }
        }

        const insertDiaryParams = [date, emoji, content, shareAgree, 'ACTIVE', diaryIdx];
        const updateDiaryResult = await diaryDao.updateDiary(connection, insertDiaryParams);

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - updateDiaryStatus Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateAnswerReject = async function (userIdx, answerIdx) {
    try {

        const connection = await pool.getConnection(async (conn) => conn);

        // 존재하는 사용자, 다이어리인지 확인
        const userResult = await diaryDao.checkUserExists(connection, userIdx);
        if (userResult.length<1) return errResponse(baseResponse.USER_NOT_EXIST);
        const answerResult = await diaryDao.checkAnswerExists(connection, answerIdx);
        if (answerResult.length<1) return errResponse(baseResponse.ANSWER_ANSWERIDX_NOT_EXIST);
        // 수정할 수 있는 유저인지 확인
        // const answeruser = await diaryDao.checkAnswerUser(connection, answerIdx, userIdx);
        // if (answeruser.length<1) return errResponse(baseResponse.DIARY_USER_INVALID);

        const updateAnswerParams = ["T", answerIdx];
        const updateAnswerResult = await diaryDao.updateAnswerReject(connection, updateAnswerParams);

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - updateAnswerReject Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createAnswer = async function (userIdx, diaryIdx, content) {
    try {

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        const insertAnswerParams = [diaryIdx, userIdx, content];
        console.log(insertAnswerParams);

        const connection = await pool.getConnection(async (conn) => conn);

        const diaryResult = await diaryDao.checkDiaryExists(connection, diaryIdx);
        if (diaryResult.length<1) return errResponse(baseResponse.DIARY_DIARYIDX_NOT_EXIST);
        if (diaryResult[0].userIdx === userIdx) return errResponse(baseResponse.ANSWER_USERIDX_INVALID);

        const answerResult = await diaryDao.insertAnswer(connection, insertAnswerParams);

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - createAnswer Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
