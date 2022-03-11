module.exports = function(app){
    const admin = require('./adminController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 12. 받은 일기 리스트 조회 API
    app.get('/app/admin/notice', admin.getNotice);


};

