module.exports = function(app){
    const admin = require('./adminController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 12. 받은 일기 리스트 조회 API
    app.get('/app/admin/notice', admin.getNotice);

    // 29. 신고하기 API
    app.post('/app/admin/report', jwtMiddleware, admin.postReport);

    // 30. 신고 조회 API
    app.get('/app/admin/report', admin.getReport);

    // 31. 신고 처리하기 API
    app.patch('/app/admin/report', admin.patchReport);
};

