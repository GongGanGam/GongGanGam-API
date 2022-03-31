const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");

const chatProvider = require("./chatProvider");
const chatDao = require("./chatDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createChatUser = async function (userIdx, chatUserIdx) {
    try {

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        const insertChatParams = [userIdx, chatUserIdx];
        console.log(insertChatParams);

        const connection = await pool.getConnection(async (conn) => conn);

        const chatResult = await chatDao.insertChat(connection, insertChatParams);

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - createChatUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


