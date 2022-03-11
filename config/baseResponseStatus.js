//Response로 보내줄 상태코드와 메세지 등을 이 파일에서 관리함

module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" }, // ?

    //Request error
    SIGNUP_EMAIL_EMPTY : { "isSuccess": false, "code": 2001, "message":"이메일을 입력해주세요" },
    SIGNUP_EMAIL_LENGTH : { "isSuccess": false, "code": 2002, "message":"이메일은 30자리 미만으로 입력해주세요." },
    SIGNUP_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2003, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNUP_PASSWORD_EMPTY : { "isSuccess": false, "code": 2004, "message": "비밀번호를 입력 해주세요." },
    SIGNUP_PASSWORD_LENGTH : { "isSuccess": false, "code": 2005, "message":"비밀번호는 6~20자리를 입력해주세요." },
    SIGNUP_NICKNAME_EMPTY : { "isSuccess": false, "code": 2006, "message":"닉네임을 입력 해주세요." },
    SIGNUP_NICKNAME_LENGTH : { "isSuccess": false,"code": 2007,"message":"닉네임은 최대 20자리를 입력해주세요." },

    SIGNIN_EMAIL_EMPTY : { "isSuccess": false, "code": 2008, "message":"이메일을 입력해주세요" },
    SIGNIN_EMAIL_LENGTH : { "isSuccess": false, "code": 2009, "message":"이메일은 30자리 미만으로 입력해주세요." },
    SIGNIN_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2010, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNIN_PASSWORD_EMPTY : { "isSuccess": false, "code": 2011, "message": "비밀번호를 입력 해주세요." },

    USER_USERID_EMPTY : { "isSuccess": false, "code": 2012, "message": "userId를 입력해주세요." },
    USER_USERID_NOT_EXIST : { "isSuccess": false, "code": 2013, "message": "해당 회원이 존재하지 않습니다." },

    USER_USEREMAIL_EMPTY : { "isSuccess": false, "code": 2014, "message": "이메일을 입력해주세요." },
    USER_USEREMAIL_NOT_EXIST : { "isSuccess": false, "code": 2015, "message": "해당 이메일을 가진 회원이 존재하지 않습니다." },
    USER_ID_NOT_MATCH : { "isSuccess": false, "code": 2016, "message": "유저 아이디 값을 확인해주세요" },
    USER_NICKNAME_EMPTY : { "isSuccess": false, "code": 2017, "message": "변경할 닉네임 값을 입력해주세요" },

    USER_STATUS_EMPTY : { "isSuccess": false, "code": 2018, "message": "회원 상태값을 입력해주세요" },

    // Response error
    SIGNUP_REDUNDANT_EMAIL : { "isSuccess": false, "code": 3001, "message":"중복된 이메일입니다." },
    SIGNUP_REDUNDANT_NICKNAME : { "isSuccess": false, "code": 3002, "message":"중복된 닉네임입니다." },

    SIGNIN_EMAIL_WRONG : { "isSuccess": false, "code": 3003, "message": "아이디가 잘못 되었습니다." },
    SIGNIN_PASSWORD_WRONG : { "isSuccess": false, "code": 3004, "message": "비밀번호가 잘못 되었습니다." },
    SIGNIN_INACTIVE_ACCOUNT : { "isSuccess": false, "code": 3005, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
    SIGNIN_WITHDRAWAL_ACCOUNT : { "isSuccess": false, "code": 3006, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},


    // 5000번대 수이
    DIARY_YEAR_EMPTY : { "isSuccess": false, "code": 5001, "message": "연도를 입력해주세요."},
    DIARY_MONTH_EMPTY : { "isSuccess": false, "code": 5002, "message": "달을 입력해주세요."},
    DIARY_DAY_EMPTY : { "isSuccess": false, "code": 5003, "message": "날짜를 입력해주세요."},
    DIARY_DIARYIDX_EMPTY : { "isSuccess": false, "code": 5004, "message": "diaryIdx를 입력해주세요."},
    DIARY_DIARYIDX_NOT_EXIST : { "isSuccess": false, "code": 5005, "message": "존재하지 않는 다이어리입니다."},
    USER_NOT_EXIST : { "isSuccess": false, "code": 5006, "message": "존재하지 않는 유저입니다."},
    DIARY_USER_INVALID : { "isSuccess": false, "code": 5007, "message": "수정할 권한이 없는 유저입니다."},
    ANSWER_ANSWERIDX_EMPTY : { "isSuccess": false, "code": 5008, "message": "answerIdx를 입력해주세요."},
    ANSWER_USERIDX_INVALID : { "isSuccess": false, "code": 5009, "message": "유저를 다시 확인해주세요."},
    ANSWER_DIARY_NOT_EXIST : { "isSuccess": false, "code": 5010, "message": "답장이 없습니다. 다시 확인해주세요."},
    DIARY_S3_ERROR : { "isSuccess": false, "code": 5011, "message": "이미지 업로드에 실패하였습니다."},
    PAGE_INVALID : { "isSuccess": false, "code": 5012, "message": "페이지 값을 다시 확인해주세요."},
    PAGE_INVALID_END : { "isSuccess": false, "code": 5013, "message": "더이상 존재하지 않는 페이지 값입니다."},
    USER_EMAIL_EMPTY : { "isSuccess": false, "code": 5014, "message": "이메일을 입력해주세요."},
    USER_IDENTIFICATION_EMPTY : { "isSuccess": false, "code": 5015, "message": "인증 번호를 입력해주세요."},
    SIGNUP_ERROR : { "isSuccess": false, "code": 5016, "message": "회원가입에 실패하였습니다. 다시 시도해주세요."},
    SIGNUP_EMAIL_EXISTS : { "isSuccess": false, "code": 5017, "message": "존재하는 이메일입니다."},
    SIGNUP_USER_EXISTS : { "isSuccess": false, "code": 5018, "message": "존재하는 사용자입니다. 로그인해주세요."},
    DIARYSHARE_USER_INVALID : { "isSuccess": false, "code": 5019, "message": "조회할 수 없는 다이어리입니다."},
    USER_TYPE_EMPTY : { "isSuccess": false, "code": 5020, "message": "회원가입한 타입을 입력해주세요."},
    USER_PROFIMG_EMPTY : { "isSuccess": false, "code": 5021, "message": "수정할 이미지가 없습니다."},
    DIARY_UPDATE_SHARE_INVALID : { "isSuccess": false, "code": 5022, "message": "이미 공유한 다이어리는 공유를 수정할 수 없습니다."},
    DIARY_SHAREAGREE_INVALID : { "isSuccess": false, "code": 5023, "message": "공유 설정이 잘못되었습니다."},
    ANSWER_ANSWERIDX_NOT_EXIST : { "isSuccess": false, "code": 5024, "message": "존재하지 않는 답장입니다."},
    LOGIN_NAVER_IDENTIFICATION_ERROR : { "isSuccess": false, "code": 5025, "message": "식별번호에 문제가 있습니다."},
    LOGIN_NAVER_TOKEN_ERROR : { "isSuccess": false, "code": 5026, "message": "토큰번호에 문제가 있습니다."},
    LOGIN_NAVER_ERROR : { "isSuccess": false, "code": 5027, "message": "네이버 로그인에 실패하였습니다."},
    // 5028 로그인 실패 회원가입해주세요

    // 6000번 소연
    USER_BIRTHYEAR_EMPTY : {"isSuccess": false, "code": 6000, "message": "출생년도 값을 입력해주세요."},
    USER_GENDER_EMPTY: {"isSuccess": false, "code": 6001, "message": "성별을 입력해주세요."},
    USER_DIARY_PUSH_EMPTY : {"isSuccess": false, "code": 6002, "message": "받은 일기 알람 설정을 선택해주세요."},
    USER_ANSWER_PUSH_EMPTY : {"isSuccess": false, "code": 6003, "message": "받은 답장 알람 설정을 선택해주세요."},
    USER_CHAT_PUSH_EMPTY : {"isSuccess": false, "code": 6004, "message": "채팅 알림 설정을 선택해주세요."},
    SIGNIN_USER_NICKNAME_EMPTY : {"isSuccess": false, "code": 6005, "message": "닉네임을 입력해주세요."},
    USER_STATUS_ALREADY_INACTIVE : {"isSuccess": false, "code": 6006, "message": "이미 탈퇴한 회원입니다."},
    PUSH_DIARY_WRONG : {"isSuccess": false, "code": 6007, "message": "받은 일기 알림 설정이 잘못 되었습니다."},
    PUSH_ANSWER_WRONG : {"isSuccess": false, "code": 6008, "message": "받은 답장 알림 설정이 잘못 되었습니다."},
    PUSH_CHAT_WRONG : {"isSuccess": false, "code": 6009, "message": "채팅 알림 설정이 잘못 되었습니다."},
    SIGNIN_IDENTIFICATION_WRONG : {"isSuccess": false, "code": 6010, "message": "식별번호가 잘못 되었습니다."},
    USER_GENDER_WRONG : {"isSuccess": false, "code": 6011, "message": "성별 설정이 잘못 되었습니다."},
    USER_SETAGE_WRONG : {"isSuccess": false, "code": 6012, "message": "연령대 지정 설정이 잘못 되었습니다."},
    USER_BIRTHYEAR_NUMBER_WRONG : {"isSuccess": false, "code": 6013, "message": "출생년도는 4자리를 입력해주세요"},
    USER_BIRTHYEAR_TIME_WRONG : {"isSuccess": false, "code": 6014, "message": "출생년도가 올바르지 않습니다."},
    USER_SETAGE_EMPTY : {"isSuccess": false, "code": 6015, "message": "연령대 지정 값을 입력해주세요."},
    LOGIN_KAKAO_TOKEN_ERROR : { "isSuccess": false, "code": 6016, "message": "카카오 토큰번호에 문제가 있습니다."},
    LOGIN_KAKAO_ERROR : { "isSuccess": false, "code": 6017, "message": "카카오 로그인에 실패하였습니다."},
}