const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");

const adminProvider = require("./adminProvider");
const adminDao = require("./adminDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createReport = async function (userIdx, reportType, idxOfType, reportDetail, reportContent) {
    try {

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        const insertReportParams = [userIdx, reportType, idxOfType, reportDetail, reportContent];
        console.log(insertReportParams);

        const connection = await pool.getConnection(async (conn) => conn);

        const reportResponse = await adminDao.insertReport(connection, insertReportParams);

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - createReport Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateReport = async function (reportIdx) {
    try {

        const connection = await pool.getConnection(async (conn) => conn);

        const updateReportParams = ["T", reportIdx];
        const updateReportResult = await adminDao.updateReportHandled(connection, updateReportParams);

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - updateReport Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createNotice = async function (title, noticeContent) {
    try {

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        const insertNoticeParams = [title, noticeContent];
        console.log(insertNoticeParams);

        const connection = await pool.getConnection(async (conn) => conn);

        const noticeResponse = await adminDao.insertNotice(connection, insertNoticeParams);

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - createNotice Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};