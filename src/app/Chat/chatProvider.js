const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const chatDao = require("./chatDao");

// Provider: Read 비즈니스 로직 처리

exports.retrieveChatList = async function (userIdx) {

    const connection = await pool.getConnection(async (conn) => conn);
    const chatList = await chatDao.selectChatList(connection, userIdx);

    connection.release();

    return chatList;
};

exports.checkUser = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const user = await chatDao.checkUserExists(connection, userIdx);

    connection.release();

    return user;
};

exports.checkUserChatValid = async function (userIdx, chatUserIdx) {
    var userValidParam = [userIdx, chatUserIdx];
    const connection = await pool.getConnection(async (conn) => conn);
    const user = await chatDao.checkUserChatValid(connection, userValidParam);

    connection.release();

    return user;
};