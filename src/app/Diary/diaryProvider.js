const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const diaryDao = require("./diaryDao");

// Provider: Read 비즈니스 로직 처리


exports.retrieveMonthList = async function (userIdx, year, month) {
    const params = [userIdx, year, month];
    const connection = await pool.getConnection(async (conn) => conn);
    const monthList = await diaryDao.selectMonthDiary(connection, params);

    connection.release();

    return monthList;
};

exports.retrieveDiary = async function (userIdx, year, month, day) {
    const params = [userIdx, year, month, day];
    const connection = await pool.getConnection(async (conn) => conn);
    const diary = await diaryDao.selectDiary(connection, params);

    if (!diary) {
        console.log(diary)
        const diaryAnswer = await diaryDao.selectDiaryAnswer(connection, diary[0].diaryIdx);
        console.log(diaryAnswer)
        diary[0].answer = diaryAnswer[0];
    }

    connection.release();

    return diary[0];
};

exports.retrieveSharedDiaryList = async function (userIdx, pageSize, offset) {
    const connection = await pool.getConnection(async (conn) => conn);
    const shareList = await diaryDao.selectShareList(connection, userIdx, pageSize, offset);

    connection.release();

    return shareList;
};

exports.retrieveAllShared = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const shareList = await diaryDao.selectAllShareList(connection, userIdx);

    connection.release();

    return shareList;
};

exports.retrieveSharedDiary = async function (diaryIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const shareList = await diaryDao.selectShareDiary(connection, diaryIdx);
    // 다이어리 답장이 있는지 확인
    const shareDiaryValid = await diaryDao.checkDiaryAnswerValid(connection, diaryIdx);
    console.log(shareDiaryValid)
    let answerValid = 'T';
    if (shareDiaryValid.length>0) answerValid = 'F'

    shareList[0].answerValid = answerValid;

    connection.release();

    return shareList[0];
};

exports.retrieveAnswerList = async function (userIdx, pageSize, offset) {
    const connection = await pool.getConnection(async (conn) => conn);
    const answerList = await diaryDao.selectAnswer(connection, userIdx, pageSize, offset);

    connection.release();

    return answerList;
};

exports.retrieveAllAnswer = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const answerList = await diaryDao.selectAllAnswer(connection, userIdx);

    connection.release();

    return answerList;
};

exports.retrieveAnswer = async function (diaryIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();

        const diary = await diaryDao.selectDiaryDetail(connection, diaryIdx);
        const params = [diaryIdx, userIdx];
        const answer = await diaryDao.selectAnswerDetail(connection, params);
        const result = {'diary' : diary[0], 'answer' : answer[0]};

        await connection.commit();
        return result;
    } catch (err) {
        console.log(err);
        await connection.rollback();
    } finally {
        connection.release();
    }
};

exports.retrieveAnswerByIdx = async function (answerIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();

        const diary = await diaryDao.selectDiaryByAnswerIdx(connection, answerIdx);
        const params = [answerIdx, userIdx];
        const answer = await diaryDao.selectAnswerByIdx(connection, params);
        const result = {'diary' : diary[0], 'answer' : answer[0]};

        await connection.commit();
        return result;
    } catch (err) {
        console.log(err);
        await connection.rollback();
    } finally {
        connection.release();
    }
};

exports.checkUser = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const user = await diaryDao.checkUserExists(connection, userIdx);

    connection.release();

    return user;
};

exports.checkDiary = async function (diaryIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const diary = await diaryDao.checkDiaryExists(connection, diaryIdx);

    connection.release();

    return diary;
};

exports.checkDiaryShareUser = async function (diaryIdx, userIdx) {
    const params = [diaryIdx, userIdx];
    const connection = await pool.getConnection(async (conn) => conn);
    const diary = await diaryDao.checkDiaryShareUser(connection, params);

    connection.release();

    return diary;
};

exports.checkAnswer = async function (answerIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const answer = await diaryDao.checkAnswerExists(connection, answerIdx);

    connection.release();

    return answer;
};