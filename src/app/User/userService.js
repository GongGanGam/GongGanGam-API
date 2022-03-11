
const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");

// user 뿐만 아니라 다른 도메인의 Provider와 Dao도 아래처럼 require하여 사용할 수 있습니다.
const userProvider = require("./userProvider");
const userDao = require("./userDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.postSignIn = async function (email, identification) {
    try {
        // 이메일 여부 확인
        const emailRows = await userProvider.userEmailCheck(email);
        if (emailRows.length < 1) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);

        const selectEmail = emailRows[0].email; //email, nickname, identification
        console.log(selectEmail);
        // 식별번호 확인 (입력한 비밀번호를 암호화한 것과 DB에 저장된 비밀번호가 일치하는 지 확인함)
        //const identificationRows = await userProvider.userIdentificationCheck(selectEmail); //identification
        console.log(emailRows[0].identification);
        if (identification !== emailRows[0].identification) {
            return errResponse(baseResponse.SIGNIN_IDENTIFICATION_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(email); //status, nickname

        if (userInfoRows[0].status === "INACTIVE") return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        console.log(userInfoRows[0].nickname);

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userIdx: userInfoRows[0].userIdx,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userIdx': userInfoRows[0].userIdx, 'userName': userInfoRows[0].nickname, 'jwt': token});

    }
    catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


exports.postKaKaoLogin = async function (identification) {
    try {
        // 계정 상태 확인
        const userInfoRows = await userProvider.accountStatusCheck(identification); //status, nickname

        if (userInfoRows[0].status === "INACTIVE") return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        console.log(userInfoRows[0].nickname);

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userIdx: userInfoRows[0].userIdx,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userIdx': userInfoRows[0].userIdx, 'userName': userInfoRows[0].nickname, 'jwt': token});

    }
    catch (err) {
        logger.error(`App - postKakaoLogin Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


exports.postNaverLogin = async function (identification) {
    try {
        // 식별번호 확인
        const identificationRows = await userProvider.checkUserExistByIdenType(identification);
        if (identificationRows.length<1) return errResponse(baseResponse.LOGIN_NAVER_IDENTIFICATION_ERROR);

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountStatusCheck(identification); //status, nickname

        if (userInfoRows[0].status === "INACTIVE") return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        console.log(userInfoRows[0].nickname);

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userIdx: userInfoRows[0].userIdx,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userIdx': userInfoRows[0].userIdx, 'userName': userInfoRows[0].nickname, 'jwt': token});

    }
    catch (err) {
        logger.error(`App - postNaverLogin Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


//04. 유저 생성
exports.createUser = async function (nickname, birthYear, gender, type, email, identification) {
    try {

        const connection = await pool.getConnection(async (conn) => conn);

        //닉네임 중복 방지
        const userNicknameRows = await userProvider.userNicknameCheck(nickname);
        if (userNicknameRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);
        //이메일 중복 방지
        const userEmailRows = await userProvider.userEmailCheck(email);
        if (userEmailRows.length > 0)
            return errResponse(baseResponse.SIGNUP_EMAIL_EXISTS);

        const hashedIdetification = await crypto
            .createHash("sha512")
            .update(identification)
            .digest("hex");
        try {
            const insertUserInfoParams = [nickname, birthYear, gender, type, email, identification];
            await connection.beginTransaction();
            const userNicknameResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
            console.log(`추가된 회원 : ${userNicknameResult[0].insertId}`)
            const userPushResult = await userDao.insertPush(connection, userNicknameResult[0].insertId);

            //토큰 생성 Service
            let token = await jwt.sign(
                {
                    userIdx: userNicknameResult[0].insertId,
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀키
                {
                    expiresIn: "365d",
                    subject: "userInfo",
                } // 유효 기간 365일
            );

            await connection.commit();
            return response(baseResponse.SUCCESS, {'userIdx': userNicknameResult[0].insertId, 'jwt': token});
        }
        catch (err) {
            await connection.rollback();
            console.log(err);
            return errResponse(baseResponse.DB_ERROR);
        }
        finally{
            connection.release();
        }
    }
    catch{
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

//04(2). 추가 정보 입력
exports.updateUserInfo = async function ( nickname, birthYear, gender, userIdx) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //닉네임 중복 방지 & 동일 유저가 같은 이름으로 수정할 때
        const userNicknameRows = await userProvider.checkUserExistByIdx(userIdx);

        //회원 존재 확인
        if (userNicknameRows.length < 1)
            return errResponse(baseResponse.SIGNIN_ERROR);
        // 수정할 이름이 중복됐는지 확인.
        const userNicknameCheck = await userProvider.checkUserName(nickname, userIdx);
        console.log(userNicknameCheck)
        if (userNicknameCheck.length>0) return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);

        const editUserResult = await userDao.updateUserSigninInfo(connection, nickname, birthYear, gender, userIdx)
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//05. 회원 정보 수정
exports.editUser = async function ( nickname, birthYear, gender, setAge, userIdx) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //닉네임 중복 방지 & 동일 유저가 같은 이름으로 수정할 때
        const userNicknameRows = await userProvider.checkUserExistByIdx(userIdx);
        console.log(userNicknameRows)

        //회원 존재 확인
        if (userNicknameRows.length < 1)
            return errResponse(baseResponse.USER_USERID_NOT_EXIST);
        // 수정할 이름이 중복됐는지 확인.
        // if (userNicknameRows[0].nickname!==nickname)
        //     return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);
        const userNicknameCheck = await userProvider.checkUserName(nickname, userIdx);
        console.log(userNicknameCheck)
        if (userNicknameCheck.length>0) return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);

        const editUserResult = await userDao.updateUserInfo(connection, nickname, birthYear, gender, setAge, userIdx)
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//07. 탈퇴하기
exports.editUserStatus = async function (userIdx) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //회원 존재 확인
        const userIdRows = await userProvider.userIdCheck(userIdx);
        if (userIdRows.length < 1)
            return errResponse(baseResponse.USER_USERID_NOT_EXIST);

        const userStatus = await userDao.selectUserStatus(connection, userIdx);
        if(userStatus[0].status=='INACTIVE') return errResponse(baseResponse.USER_STATUS_ALREADY_INACTIVE);

        const editStatusResult = await userDao.updateUserStatus(connection, userIdx);
        connection.release();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        logger.error(`App - editUserStatus Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//09.받은 일기 알림 설정
exports.editDiaryPush= async function (userIdx, diaryPush) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //회원 존재 확인
        const userIdRows = await userProvider.userIdCheck(userIdx);
        if (userIdRows.length < 1)
            return errResponse(baseResponse.USER_USERID_NOT_EXIST);

        const editDiaryPushResult = await userDao.updateDiaryPush(connection, userIdx, diaryPush);
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editDiaryPush Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//10. 받은 답장 알림 설정
exports.editAnswerPush = async function (userIdx, answerPush) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //회원 존재 확인
        const userIdRows = await userProvider.userIdCheck(userIdx);
        if (userIdRows.length < 1)
            return errResponse(baseResponse.USER_USERID_NOT_EXIST);

        const editAnswerPushResult = await userDao.updateAnswerPush(connection, userIdx, answerPush);
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editAnswerPush Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//11. 채팅 알림 설정
exports.editChatPush = async function (userIdx, chatPush) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //회원 존재 확인
        const userIdRows = await userProvider.userIdCheck(userIdx);
        if (userIdRows.length < 1)
            return errResponse(baseResponse.USER_USERID_NOT_EXIST);

        const editChatPushResult = await userDao.updateChatPush(connection, userIdx, chatPush);
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editChatPush Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//25. 유저 프로필 사진 업로드
exports.updateUserImg = async function (userIdx, imgUrl) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //회원 존재 확인
        const userIdRows = await userProvider.userIdCheck(userIdx);
        if (userIdRows.length < 1)
            return errResponse(baseResponse.USER_USERID_NOT_EXIST);

        const editUserImgResult = await userDao.updateUserImg(connection, userIdx, imgUrl);
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - updateUserImg Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}