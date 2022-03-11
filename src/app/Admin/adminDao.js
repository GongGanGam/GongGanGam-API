
// 공지사항 조회
async function selectNoticeList(connection, pageSize, offset) {
    const params = [pageSize, offset]
    const selectNoticeQuery = `
        select title, noticeContent, date_format(updatedAt, '%Y.%c.%e') as noticeDate
        from Notice order by updatedAt limit ? offset ?;
    `;
    const [noticeRows] = await connection.query(selectNoticeQuery, params);
    return noticeRows;
}

// 모든 공지사항 조회
async function selectAllNoticeList(connection) {
    const selectNoticeQuery = `
        select title, noticeContent, date_format(updatedAt, '%Y.%c.%e') as noticeDate
        from Notice order by updatedAt;
    `;
    const [noticeRows] = await connection.query(selectNoticeQuery);
    return noticeRows;
}


module.exports = {
    selectNoticeList, selectAllNoticeList
};

