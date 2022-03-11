
// 유저 생성
//const {USER_STATUS_EMPTY} = require("./baseResponseStatus");

async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User(nickname, birthYear, gender, type, email, identification)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
      insertUserInfoQuery,
      insertUserInfoParams
  );

  return insertUserInfoRow;
}

async function insertPush(connection, userIdx) {
  const insertPushQuery = `
        INSERT INTO Push(diaryPush, answerPush, chatPush, userIdx)
        VALUES (?, ?, ?, ?);
    `;
  const insertPushRow = await connection.query(insertPushQuery, ['T','T','T', userIdx]);

  return insertPushRow;
}

// 모든 유저 조회
async function selectUser(connection) {
  const selectUserListQuery = `
            SELECT nickname,birthYear, gender
            FROM User;
                `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

// 닉네임으로 회원 조회
async function selectUserNickname(connection, nickname) {
  const selectUserNicknameQuery = `
    SELECT nickname
    FROM User
    WHERE nickname=?;
  `;
  const [nicknameRows] = await connection.query(selectUserNicknameQuery, nickname);
  return nicknameRows;
}

// userId 회원 조회
async function selectUserId(connection, userIdx) {
  const selectUserIdQuery = `
                 SELECT  nickname, birthYear, diaryPush, answerPush, chatPush, profImg, email
                 FROM User
                 JOIN Push ON Push.userIdx=User.userIdx
                 WHERE User.userIdx = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, userIdx);
  return userRow;
}

// email 회원 조회
async function selectUserEmail(connection, email) {
  const selectUserEmailQuery = `
    select email, identification, nickname
    from User
    where email=?;
                 `;
  const [userRow] = await connection.query(selectUserEmailQuery, email);
  return userRow;
}

async function selectUserIdentification(connection, selectEmail) {
  const selectUserIdentificationQuery = `
    select identification
    from User
    where email = ?`;
  const [userRow] = await connection.query(selectUserIdentificationQuery, selectEmail);
  return userRow;
}

// 이메일, 식별값으로 사용자 존재하는지 확인
async function selectUserCheck(connection, email, identification) {
  const params = [email, identification]
  const selectUserQuery = `
    select userIdx, identification
    from User
    where User.email = ? and identification = ?;
                 `;
  const [userRow] = await connection.query(selectUserQuery, params);
  return userRow;
}

// 식별값으로 사용자 존재하는지 확인
async function selectUserCheckIden(connection, identification) {

  const selectUserQuery = `
    select userIdx, identification
    from User
    where identification = ?;
                 `;
  const [userRow] = await connection.query(selectUserQuery, identification);
  return userRow;
}


async function selectUserCheckIdenTypeKaKao(connection, identification) {
  const params = [identification, 'kakao']
  const selectUserQuery = `
    select userIdx, identification
    from User
    where identification = ? and type = ?;
                 `;
  const [userRow] = await connection.query(selectUserQuery, params);
  return userRow;
}

// 식별값으로 사용자 존재하는지 확인
async function selectUserCheckIdenType(connection, identification) {
  const params = [identification, 'naver']
  const selectUserQuery = `
    select userIdx, identification
    from User
    where identification = ? and type = ?;
                 `;
  const [userRow] = await connection.query(selectUserQuery, params);
  return userRow;
}

// userIdx로 사용자가 존재하는지 확인
async function checkUserByIdx(connection, userIdx) {
  const selectUserQuery = `
    select userIdx, nickname
    from User
    where userIdx=?;
                 `;
  const [userRow] = await connection.query(selectUserQuery, userIdx);
  return userRow;
}

// 중복되는 닉네임이 있는지 확인 (자신 제외)
async function checkUserByName(connection, nickname, userIdx) {
  const params = [nickname, userIdx];
  console.log(params)
  const selectUserQuery = `
    select nickname
    from User
    where nickname=? and userIdx not in (?);
                 `;
  const [userRow] = await connection.query(selectUserQuery, params);
  return userRow;
}

// 유저 계정 상태 체크 (jwt 생성 위해 nickname 값도 가져온다.)
async function selectUserAccount(connection, email) {
  const selectUserAccountQuery = `
        SELECT status, nickname, userIdx
        FROM User
        WHERE email = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      email
  );
  return selectUserAccountRow[0];
}

// 유저 계정 상태 체크 (jwt 생성 위해 nickname 값도 가져온다.)
async function selectUserStatusByIden(connection, identification) {
  const selectUserAccountQuery = `
        SELECT status, nickname, userIdx
        FROM User
        WHERE identification = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      identification
  );
  return selectUserAccountRow[0];
}

async function updateUserInfo(connection,nickname, birthYear, gender, setAge, userIdx) {
  const updateUserQuery = `
    UPDATE User
    SET nickname=?, birthYear=?, gender=?, setAge=?
    WHERE userIdx = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [nickname, birthYear, gender, setAge, userIdx]);
  return updateUserRow[0];
}

async function selectUserStatus(connection, userIdx){
  const selectUserStatusQuery = `
    SELECT status
    FROM User
    WHERE userIdx=?;`;
  const [selectStatusRow] = await connection.query(selectUserStatusQuery,userIdx);
  return selectStatusRow;
}

async function updateUserStatus(connection,  userIdx) {
  const updateUserStatusQuery = `
    UPDATE User
    SET status = ?
    WHERE userIdx = ?;`;
  const updateUserStatusRow = await connection.query(updateUserStatusQuery, ['INACTIVE', userIdx]);
  return updateUserStatusRow[0];
}

async function updateDiaryPush(connection, userIdx, diaryPush) {

  const updateDiaryPushQuery = `
    UPDATE Push
    SET diaryPush = ?
    WHERE userIdx = ?;`;
  const updateDiaryPushRow = await connection.query(updateDiaryPushQuery,[diaryPush, userIdx]);
  return updateDiaryPushRow[0];
}

async function updateAnswerPush(connection, userIdx, answerPush){
  const updateAnswerPushQuery = `
    UPDATE Push
    SET answerPush = ?
    WHERE userIdx = ?;`;
  const updateAnswerPushRow = await connection.query(updateAnswerPushQuery,[answerPush, userIdx]);
  return updateAnswerPushRow[0];
}

async function updateChatPush(connection, userIdx, chatPush){
  const updateChatPushQuery = `
    UPDATE Push
    SET chatPush = ?
    WHERE userIdx = ?;`;
  const updateChatPushRow = await connection.query(updateChatPushQuery,[chatPush, userIdx]);
  return updateChatPushRow[0];
}

async function updateUserImg(connection, userIdx, imgUrl){
  const params = [imgUrl, userIdx];
  const updateUserImgQuery = `
    UPDATE User
    SET profImg = ?
    WHERE userIdx = ?;`;
  const updateUserImgRow = await connection.query(updateUserImgQuery,params);
  return updateUserImgRow[0];
}

module.exports = {
  selectUser,
  selectUserNickname,
  selectUserId,
  insertUserInfo,
  updateUserInfo,
  updateUserStatus,
  updateDiaryPush,
  updateAnswerPush,
  updateChatPush,
  selectUserStatus,
  selectUserCheck,
  selectUserEmail,
  insertPush,
  selectUserIdentification,
  selectUserAccount,
  checkUserByIdx,
  checkUserByName,
  updateUserImg,
  selectUserCheckIden,
  selectUserCheckIdenType,
  selectUserStatusByIden,
  selectUserCheckIdenTypeKaKao,
};

