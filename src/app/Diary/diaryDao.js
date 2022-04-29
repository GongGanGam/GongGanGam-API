
// 해당 달의 이모티콘들 조회
async function selectMonthDiary(connection, params) {
    const selectMonthDiaryQuery = `
        select date_format(diaryDate, '%e') as day, emoji
        from Diary
        where userIdx=? and year(diaryDate) - ? = 0 and month(diaryDate) - ? =0  and status = 'ACTIVE'
        order by diaryDate;
    `;
    const [monthRows] = await connection.query(selectMonthDiaryQuery, params);
    return monthRows;
}

// 전 달의 이모티콘들 조회
async function selectPreviousDiary(connection, params) {
    const selectMonthDiaryQuery = `
        select date_format(diaryDate, '%e') as day, emoji
        from Diary
        where userIdx=? and year(diaryDate) - ? = 0 and month(diaryDate) - ? =0  and day(diaryDate) > (? - 6) and status = 'ACTIVE'
        order by diaryDate;
    `;
    const [monthRows] = await connection.query(selectMonthDiaryQuery, params);
    return monthRows;
}

// 다음 달의 이모티콘들 조회
async function selectNextDiary(connection, params) {
    const selectMonthDiaryQuery = `
        select date_format(diaryDate, '%e') as day, emoji
        from Diary
        where userIdx=? and year(diaryDate) - ? = 0 and month(diaryDate) - ? =0  and day(diaryDate) < 14 and status = 'ACTIVE'
        order by diaryDate;
    `;
    const [monthRows] = await connection.query(selectMonthDiaryQuery, params);
    return monthRows;
}

// 그날의 다이어리 가져오기
async function selectDiary(connection, params) {
    const selectDeliveryQuery = `
        select diaryIdx, emoji, date_format(diaryDate, '%Y년 %c월 %e일') as diaryDate, contents, imgUrl as image
        from Diary
        where userIdx=? and year(diaryDate) - ? = 0 and month(diaryDate) - ? =0
          and day(diaryDate) - ? = 0  and status = 'ACTIVE';
                `;
    const [diaryInfo] = await connection.query(selectDeliveryQuery, params);
    return diaryInfo;
}

// 그날의 다이어리에서 그 다이어리의 답장 가져오기
async function selectDiaryAnswer(connection, diaryIdx) {
    const selectDeliveryQuery = `
        select answerIdx, answerUserIdx as userIdx, nickname, profImg as userProfImg,
               date_format(User.updatedAt, '%y.%m.%d') as answerTime, answerContents
        from Answer join User on answerUserIdx=User.userIdx
        where diaryIdx=?;
                `;
    const [diaryInfo] = await connection.query(selectDeliveryQuery, diaryIdx);
    return diaryInfo;
}

// 공유된 다이어리 리스트 가져오기
async function selectShareList(connection, userIdx, pageSize, offset) {
    const params = [userIdx, pageSize, offset];
    const selectDeliveryQuery = `
        select DiaryShare.diaryIdx, Diary.userIdx, nickname as userNickname, profImg as userProfImg, contents as diaryContents,
               date_format(diaryDate, '%y.%m.%d') as diaryDate, isRead
        from DiaryShare join Diary on Diary.diaryIdx=DiaryShare.diaryIdx
                        join User on Diary.userIdx = User.userIdx
        where shareUserIdx=? order by diaryDate limit ? offset ?;
                `;
    const [diaryInfo] = await connection.query(selectDeliveryQuery, params);
    return diaryInfo;
}

// 공유된 다이어리 리스트 가져오기
async function selectAllShareList(connection, userIdx) {
    const selectDeliveryQuery = `
        select DiaryShare.diaryIdx
        from DiaryShare join Diary on Diary.diaryIdx=DiaryShare.diaryIdx
        where shareUserIdx=? and Diary.status = 'ACTIVE' order by diaryDate;
                `;
    const [diaryInfo] = await connection.query(selectDeliveryQuery, userIdx);
    return diaryInfo;
}

// 공유된 다이어리 가져오기
async function selectShareDiary(connection, diaryIdx) {
    const selectDeliveryQuery = `
        select Diary.userIdx, nickname as userNickname, profImg as userProfImg, diaryIdx,
               date_format(diaryDate, '%Y년 %c월 %e일') as diaryDate, contents as diaryContent, imgUrl as diaryImg
        from Diary join User on Diary.userIdx=User.userIdx
        where diaryIdx=?;
                `;
    const [diaryInfo] = await connection.query(selectDeliveryQuery, diaryIdx);
    return diaryInfo;
}

// 받은 답장 리스트 가져오기
async function selectAnswer(connection, userIdx, pageSize, offset) {
    const params = [userIdx, pageSize, offset];
    const selectAnswerQuery = `
        select answerIdx, User.userIdx, nickname as userNickname, profImg as userProfImg, answerContents,
               date_format(Answer.createdAt, '%y.%m.%d') as answerDate, isRead
        from Answer join Diary on Diary.diaryIdx=Answer.diaryIdx
                    join User on Diary.userIdx = User.userIdx
        where answerUserIdx=? and Answer.status='ACTIVE' order by Answer.createdAt  limit ? offset ?;
                `;
    const [diaryInfo] = await connection.query(selectAnswerQuery, params);
    return diaryInfo;
}

// 일기에 대해 답장을 할 수 있는지
async function checkDiaryAnswerValid(connection, diaryIdx) {
    const selectShareDiaryValidQuery = `
        select answerIdx
        from Answer
        where diaryIdx=?;
                `;
    const [diaryInfo] = await connection.query(selectShareDiaryValidQuery, diaryIdx);
    return diaryInfo;
}

async function selectAllAnswer(connection, userIdx) {
    const selectAnswerQuery = `
        select answerIdx
        from Answer join Diary on Diary.diaryIdx=Answer.diaryIdx
        where answerUserIdx=? and Answer.status='ACTIVE' order by Answer.updatedAt;
                `;
    const [diaryInfo] = await connection.query(selectAnswerQuery, userIdx);
    return diaryInfo;
}

// 받은 답장 가져오기
async function selectAnswerDetail(connection, params) {
    const selectDeliveryQuery = `
        select answerIdx, User.userIdx, nickname as userNickname, profImg as userProfImg,
               date_format(Answer.updatedAt, '%Y년 %c월 %e일') as answerDate, answerContents
        from Answer join Diary on Diary.diaryIdx=Answer.diaryIdx
                    join User on Diary.userIdx = User.userIdx
        where Answer.diaryIdx=? and answerUserIdx=? and Answer.status='ACTIVE';
                `;
    const [diaryInfo] = await connection.query(selectDeliveryQuery, params);
    return diaryInfo;
}

// 받은 답장 페이지에 다이어리 내용 가져오기
async function selectDiaryDetail(connection, diaryIdx) {
    const selectDeliveryQuery = `
        select diaryIdx, emoji, date_format(diaryDate, '%Y년 %c월 %e일') as diaryDate, contents as diaryContent
        from Diary
        where diaryIdx = ?;
                `;
    const [diaryInfo] = await connection.query(selectDeliveryQuery, diaryIdx);
    return diaryInfo;
}

// 받은 답장 페이지에 다이어리 내용 가져오기(수정함)
async function selectDiaryByAnswerIdx(connection, answerIdx) {
    const selectDiaryQuery = `
        select Diary.diaryIdx, emoji, date_format(diaryDate, '%Y년 %c월 %e일') as diaryDate, contents as diaryContent
        from Diary join Answer on Answer.diaryIdx = Diary.diaryIdx
        where answerIdx = ?;
                `;
    const [diaryInfo] = await connection.query(selectDiaryQuery, answerIdx);
    return diaryInfo;
}

// 받은 답장 가져오기(수정함)
async function selectAnswerByIdx(connection, params) {
    const selectDeliveryQuery = `
        select answerIdx, answerUserIdx, profImg, nickname,
               date_format(Answer.updatedAt, '%Y년 %c월 %e일') as answerDate, answerContents, Answer.isReject
        from Answer join User on answerUserIdx = User.userIdx
        where answerIdx = ? and answerUserIdx=? and Answer.status='ACTIVE';
                `;
    const [diaryInfo] = await connection.query(selectDeliveryQuery, params);
    return diaryInfo;
}

// 랜덤의 유저 가져오기
async function selectRandUser(connection, userIdx) {
    const selectDeliveryQuery = `
        select userIdx
        from User
        where userIdx != ?
        order by rand() limit 1;
                `;
    const [diaryInfo] = await connection.query(selectDeliveryQuery, userIdx);
    return diaryInfo;
}

// 다이어리 생성
async function insertDiary(connection, insertDiaryParams) {
    const insertDiaryQuery = `
        INSERT INTO Diary(userIdx, diaryDate, emoji, contents, shareAgree)
        VALUES (?, ?, ?, ?, ?);
    `;
    const insertHeartRow = await connection.query(
        insertDiaryQuery,
        insertDiaryParams
    );

    return insertHeartRow;
}

// 다이어리 생성 (사진 포함)
async function insertDiaryImg(connection, insertDiaryParams) {
    const insertDiaryQuery = `
        INSERT INTO Diary(userIdx, diaryDate, emoji, contents, shareAgree, imgUrl)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
    const insertHeartRow = await connection.query(
        insertDiaryQuery,
        insertDiaryParams
    );

    return insertHeartRow;
}

// 답장하기
async function insertAnswer(connection, insertAnswerParams) {
    const insertAnswerQuery = `
        INSERT INTO Answer(diaryIdx, answerUserIdx, answerContents)
        VALUES (?, ?, ?);
    `;
    const insertAnswerRow = await connection.query(
        insertAnswerQuery,
        insertAnswerParams
    );

    return insertAnswerRow;
}

// 답장하기
async function insertShare(connection, shareParams) {
    const insertShareQuery = `
        INSERT INTO DiaryShare(diaryIdx, shareUserIdx)
        VALUES (?, ?);
    `;
    const insertAnswerRow = await connection.query(
        insertShareQuery,
        shareParams
    );

    return insertAnswerRow;
}

// 다이어리 status를 F로 수정하기
async function updateDiaryStatus(connection, diaryIdx) {
    const params = ['INACTIVE', diaryIdx];
    const updateReviewQuery = `
        UPDATE Diary 
        SET status = ?
        WHERE diaryIdx = ?;`;
    const updateUserRow = await connection.query(updateReviewQuery, params);
    return updateUserRow[0];
}

// 공유된 다이어리 읽은 상태 수정하기
async function updateDiaryReadStatus(connection, diaryIdx) {
    const params = ['T', diaryIdx]
    const updateDiaryReadQuery = `
        UPDATE DiaryShare 
        SET isRead = ?
        WHERE diaryIdx = ?;`;
    const updateUserRow = await connection.query(updateDiaryReadQuery, params);
    return updateUserRow[0];
}

// 답장 읽은 상태 수정하기
async function updateAnswerReadStatus(connection, answerIdx) {
    const params = ['T', answerIdx]
    const updateDiaryReadQuery = `
        UPDATE Answer 
        SET isRead = ?
        WHERE answerIdx = ?;`;
    const updateUserRow = await connection.query(updateDiaryReadQuery, params);
    return updateUserRow[0];
}

// 다이어리 수정하기
async function updateDiary(connection, params) {
    const updateReviewQuery = `
        UPDATE Diary 
        SET diaryDate = ?, emoji = ?, contents = ?, shareAgree = ?, status = ?
        WHERE diaryIdx = ?;`;
    const updateUserRow = await connection.query(updateReviewQuery, params);
    return updateUserRow[0];
}

// 답장 거절하기
async function updateAnswerReject(connection, params) {
    const updateReviewQuery = `
        UPDATE Answer 
        SET isReject = ?
        WHERE answerIdx = ?;`;
    const updateUserRow = await connection.query(updateReviewQuery, params);
    return updateUserRow[0];
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

// 존재하는 다이어리인지 확인
async function checkDiaryExists(connection, diaryIdx) {
    const selectUserQuery = `
        select diaryIdx, userIdx
        from Diary
        where diaryIdx=?;
                `;
    const [diaryInfo] = await connection.query(selectUserQuery, diaryIdx);
    return diaryInfo;
}

// 존재하는 다이어리인지 확인
async function checkDiaryShareUser(connection, params) {
    const selectUserQuery = `
        select diaryShareIdx
        from DiaryShare
        where diaryIdx=? and shareUserIdx=?;
                `;
    const [diaryInfo] = await connection.query(selectUserQuery, params);
    return diaryInfo;
}

// 공유한 다이어리인지 확인
async function checkShareAgree(connection, diaryIdx) {
    const selectShareAgreeQuery = `
        select shareAgree
        from Diary
        where diaryIdx=?;
                `;
    const [diaryInfo] = await connection.query(selectShareAgreeQuery, diaryIdx);
    return diaryInfo;
}

// 답장 확인
async function checkAnswerExists(connection, answerIdx) {
    const selectShareAgreeQuery = `
        select answerIdx, answerUserIdx
        from Answer
        where answerIdx=?;
                `;
    const [diaryInfo] = await connection.query(selectShareAgreeQuery, answerIdx);
    return diaryInfo;
}

module.exports = {
    selectMonthDiary, selectDiary, selectDiaryAnswer, selectShareList, selectShareDiary,
    insertDiary, updateDiaryStatus, checkUserExists, checkDiaryExists, selectAnswer,
    selectDiaryDetail, selectAnswerDetail, insertAnswer, selectRandUser, updateDiary,
    insertShare, insertDiaryImg, selectAllShareList, selectAllAnswer, updateDiaryReadStatus,
    checkDiaryShareUser, checkShareAgree, checkAnswerExists, selectDiaryByAnswerIdx,
    selectAnswerByIdx, updateAnswerReject, checkDiaryAnswerValid, updateAnswerReadStatus,
    selectPreviousDiary, selectNextDiary
};
