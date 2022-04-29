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

/**
 * API No. 29
 * API Name : 신고하기 API
 * [POST] /app/admin/report
 */
exports.postReport = async function (req, res) {

    /**
     * Body: content, diaryIdx
     */

    const {reportType, idxOfType, reportDetail, reportContent} = req.body;

    const userIdx = req.verifiedToken.userIdx;
    console.log('userIdx: ' + userIdx)

    if (!(reportType == 'chat' || reportType == 'diary' || reportType == 'answer')) return res.send(errResponse(baseResponse.REPORT_TYPE_INVALID));

    if (reportDetail > 4 || reportDetail < 1) return res.send(errResponse(baseResponse.REPORT_DETAIL_INVALID));

    const postReportResponse = await adminService.createReport(userIdx, reportType, idxOfType, reportDetail, reportContent);
    return res.send(postReportResponse);

};

/**
 * API No. 30
 * API Name : 신고내역 조회 API
 * [GET] /app/admin/report
 */
exports.getReport = async function (req, res) {

    const reportResult = await adminProvider.retrieveReport();

    return res.send(response(baseResponse.SUCCESS, reportResult));

};

/**
 * API No. 31
 * API Name : 신고처리하기 API
 * [PATCH] /app/admin/report
 */
exports.patchReport = async function (req, res) {

    const {reportIdx} = req.body;

    if (!reportIdx) return res.send(errResponse(baseResponse.REPORT_REPORTIDX_EMPTY));
    // 없는 reportIdx 조회한 경우
    const reportCheck = await adminProvider.checkReport(reportIdx);
    if (reportCheck.length<1) return res.send(errResponse(baseResponse.REPORT_REPORTIDX_INVALID));

    const patchReportResponse = await adminService.updateReport(reportIdx);
    return res.send(patchReportResponse);

};