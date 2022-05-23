
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

// 모든 신고사항 조회
async function selectReport(connection) {
    const selectReportQuery = `
        select reportIdx, userIdx, reportType, idxOfType, reportDetail, reportContent, isHandled, date_format(createdAt, '%Y.%c.%e') as createdAt
        from Report
        order by createdAt;
    `;
    const [reportRows] = await connection.query(selectReportQuery);
    return reportRows;
}

// 신고하기
async function insertReport(connection, insertReportParams) {
    const insertReportQuery = `
        INSERT INTO Report(userIdx, reportType, idxOfType, reportDetail, reportContent)
        VALUES (?, ?, ?, ?, ?);
    `;
    const insertReportRow = await connection.query(
        insertReportQuery,
        insertReportParams
    );

    return insertReportRow;
}

// 공지사항 쓰기
async function insertNotice(connection, insertReportParams) {
    const insertNoticeQuery = `
        INSERT INTO Notice(title, noticeContent)
        VALUES (?, ?);
    `;
    const insertReportRow = await connection.query(
        insertNoticeQuery,
        insertReportParams
    );

    return insertReportRow;
}

// 다이어리 status를 F로 수정하기
async function updateReportHandled(connection, params) {
    const updateReviewQuery = `
        UPDATE Report 
        SET isHandled = ?
        WHERE reportIdx = ?;`;
    const updateUserRow = await connection.query(updateReviewQuery, params);
    return updateUserRow[0];
}

// 신고 조회 idx
async function selectReportByIdx(connection, reportIdx) {
    const selectReportQuery = `
        select reportIdx, userIdx, reportType, idxOfType, reportDetail, reportContent, isHandled, date_format(createdAt, '%Y.%c.%e') as createdAt
        from Report
        where reportIdx = ?;
    `;
    const [reportRows] = await connection.query(selectReportQuery, reportIdx);
    return reportRows;
}

module.exports = {
    selectNoticeList, selectAllNoticeList, insertReport, selectReport, updateReportHandled, selectReportByIdx,
    insertNotice,
};

