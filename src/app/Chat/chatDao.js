// 채팅 생성
async function insertChat(connection, insertChatParams) {
    const insertChatQuery = `
        INSERT INTO Chat(myUserIdx, chatUserIdx)
        VALUES (?, ?);
    `;
    const insertHeartRow = await connection.query(
        insertChatQuery,
        insertChatParams
    );

    return insertHeartRow;
}

// 존재하는 사용자인지 확인
async function checkUserExists(connection, userIdx) {
    const selectUserQuery = `
        select userIdx
        from User
        where userIdx=?;
                `;
    const [diaryInfo] = await connection.query(selectUserQuery, userIdx);
    return diaryInfo;
}

async function selectChatList(connection, userIdx) {
    const selectChatQuery = `
        select chatUserIdx, nickname, profImg
        from Chat join User on chatUserIdx=User.userIdx
        where myUserIdx = ?;
                `;
    const [diaryInfo] = await connection.query(selectChatQuery, userIdx);
    return diaryInfo;
}

module.exports = {
    insertChat, checkUserExists, selectChatList
};
