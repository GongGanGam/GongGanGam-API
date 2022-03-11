const jwtMiddleware = require("../../../config/jwtMiddleware");
const adminProvider = require("../../app/Admin/adminProvider");
const adminService = require("../../app/Admin/adminService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

/**
 * API No. 22
 * API Name : 공지사항 조회 API
 * [GET] /app/admin/notice?page=
 */
exports.getNotice = async function (req, res) {

    // 페이징 처리 (테스트 용으로 페이지 사이즈 3)
    let page = req.query.page;
    if (!page) page = 1;
    console.log('page Num:' + page);
    const pageSize = 3;
    let pageNum = Number(page);
    const offset = pageSize * pageNum - pageSize;
    console.log('pageNum: ' + pageNum);
    console.log('offset: ' + offset);

    if (offset<0) return res.send(errResponse(baseResponse.PAGE_INVALID));

    const allnotices = await adminProvider.retrieveAllNotice();

    if (allnotices.length < offset) return res.send(errResponse(baseResponse.PAGE_INVALID_END));
    const totalPage = Math.ceil(allnotices.length/pageSize);
    console.log('totalPage: ' + totalPage);

    const noticeResult = await adminProvider.retrieveNotice(pageSize, offset);

    const pageInfo = {"curPage" : parseInt(page), "totalPage" : totalPage, "pageSize" : pageSize};
    const result = {"page" : pageInfo, "notices":noticeResult};

    return res.send(response(baseResponse.SUCCESS, result));

};