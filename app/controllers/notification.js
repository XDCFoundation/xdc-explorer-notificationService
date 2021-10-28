'use strict';
const mongoose = require('mongoose');
const co = require('co');
const Utils = require('../utils');
const BLManager = require('../managers/push_notification_bl_manager.js');
const Constants = require('../common/constants');
const Notifications = mongoose.model('NS-Notification');

exports.addToNotifications = co.wrap(function* (request, response) {
    Utils.LHTLog('addToNotifications', 'start:before save notification', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {request: request.body}
    }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    var notification = new Notifications(request.body);

    var addToNotificationsResponse = yield BLManager.addToNotifications(notification, request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY]);

    if (addToNotificationsResponse) {
        Utils.LHTLog('addToNotifications', 'end:after save notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {addToNotificationsResponse: addToNotificationsResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, addToNotificationsResponse, Constants.NOTIFICATION_SAVED_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);
    }
    else {
        Utils.LHTLog('addToNotifications', 'end:after save notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {addToNotificationsResponse: addToNotificationsResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, {}, Constants.WEBSERVICE_ERROR_RESPONSE, Constants.RESPONSE_FAILURE);
    }
});

exports.addNotificationList = co.wrap(function* (request, response) {
    Utils.LHTLog('addNotificationList', 'start', {
        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
        data: {request: request.body}
    }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    var requestNotificationList = request.body.notifications;
    var notificationList = [];

    if (requestNotificationList.length <= 0) {
        Utils.LHTLog('addNotificationList', 'end', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {requestNotificationList: requestNotificationList}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, {}, Constants.WEBSERVICE_ERROR_RESPONSE, Constants.RESPONSE_FAILURE);
        return;
    }

    for (var index = 0; index < requestNotificationList.length; index++) {
        var notificationModel = new Notifications(requestNotificationList[index]);
        notificationList.push(notificationModel);
    }
    Utils.LHTLog('addNotificationList', 'before save notification list', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {notificationList: notificationList}
    }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
    var addToNotificationsResponse = yield BLManager.addNotificationList(notificationList);

    if (addToNotificationsResponse) {
        Utils.LHTLog('addNotificationList', 'end:after save notification list', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {addToNotificationsResponse: addToNotificationsResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, addToNotificationsResponse, Constants.NOTIFICATION_SAVED_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);
    } else {
        Utils.LHTLog('addNotificationList', 'end:after save notification list', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {addToNotificationsResponse: addToNotificationsResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, [], Constants.WEBSERVICE_ERROR_RESPONSE, Constants.RESPONSE_FAILURE);
    }
});

exports.getNotificationList = co.wrap(function* (request, response) {
    Utils.LHTLog('getNotificationList', 'start', {
        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
        data: {request: request.params}
    }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
    var notification = new Notifications(request.params);
    var getNotificationListResponse = yield BLManager.getNotificationList(notification, request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY]);
    Utils.LHTLog('getNotificationList', 'end', {
        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
        data: {getNotificationListResponse: getNotificationListResponse}
    }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
    Utils.respond(response, getNotificationListResponse, Constants.NOTIFICATION_FETCHED_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);
});

exports.markNotificationRead = co.wrap(function* (request, response) {
    Utils.LHTLog('markNotificationRead', 'start:before update notification', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {request: request.body}
    }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    var notification = new Notifications(request.body);
    var markNotificationReadResponse = yield BLManager.markNotificationRead(notification);

    if (markNotificationReadResponse) {
        Utils.LHTLog('markNotificationRead', 'end:after update notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {markNotificationReadResponse: markNotificationReadResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, markNotificationReadResponse, Constants.NOTIFICATION_MARKED_READ_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);
    } else {
        Utils.LHTLog('markNotificationRead', 'end:after update notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {markNotificationReadResponse: markNotificationReadResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, {}, Constants.NOTIFICATION_MARKED_READ_FAILED, Constants.RESPONSE_FAILURE);
    }
});

exports.markNotificationUnread = co.wrap(function* (request, response) {
    Utils.LHTLog('markNotificationUnread', 'start:before update notification', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {request: request.body}
    }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    var notification = new Notifications(request.body);
    var markNotificationUnreadResponse = yield BLManager.markNotificationUnread(notification);

    if (markNotificationUnreadResponse) {
        Utils.LHTLog('markNotificationUnread', 'end:after update notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {markNotificationUnreadResponse: markNotificationUnreadResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, markNotificationUnreadResponse, Constants.NOTIFICATION_MARKED_UNREAD_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);
    } else {
        Utils.LHTLog('markNotificationUnread', 'end:after update notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {markNotificationUnreadResponse: markNotificationUnreadResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, {}, Constants.NOTIFICATION_MARKED_UNREAD_FAILED, Constants.RESPONSE_FAILURE);
    }
});

exports.markAllNotificationRead = co.wrap(function* (request, response) {
    Utils.LHTLog('markAllNotificationRead', 'start:before update notification', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {request: request.body}
    }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    var notification = new Notifications(request.body);
    var markNotificationReadResponse = yield BLManager.markAllNotificationRead(notification);

    if (markNotificationReadResponse) {
        Utils.LHTLog('markAllNotificationRead', 'end:after update notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {markNotificationReadResponse: markNotificationReadResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, markNotificationReadResponse, Constants.NOTIFICATION_MARKED_READ_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);
    } else {
        Utils.LHTLog('markAllNotificationRead', 'end:after update notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {markNotificationReadResponse: markNotificationReadResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, {}, Constants.NOTIFICATION_MARKED_READ_FAILED, Constants.RESPONSE_FAILURE);
    }
});


exports.markAllNotificationReadByQuery = co.wrap(function* (request, response) {
    Utils.LHTLog('markAllNotificationRead', 'start:before update notification', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {request: request.body}
    }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    var markNotificationReadResponse = yield BLManager.markAllNotificationReadByQueryObj(request.body.queryObj);

    if (markNotificationReadResponse) {
        Utils.LHTLog('markAllNotificationRead', 'end:after update notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {markNotificationReadResponse: markNotificationReadResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, markNotificationReadResponse, Constants.NOTIFICATION_MARKED_READ_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);
    } else {
        Utils.LHTLog('markAllNotificationRead', 'end:after update notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {markNotificationReadResponse: markNotificationReadResponse}
        }, "Manish", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, {}, Constants.NOTIFICATION_MARKED_READ_FAILED, Constants.RESPONSE_FAILURE);
    }
});

exports.getNotificationListByQueryObj = co.wrap(function* (req, res) {
    Utils.LHTLog('getNotificationListByQueryObj', 'start', {
        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
        data: {request: req.body}
    }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    let getNotificationListByQueryObjResponse = yield BLManager.getNotificationByQueryObj(req.body, req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY]).catch(function (err) {

        Utils.LHTLog('getNotificationListByQueryObj', 'end', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {getNotificationListByQueryObj: getNotificationListByQueryObjResponse}
        }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

        return Utils.respond(res, {}, err.message ? err.message : Constants.WEBSERVICE_ERROR_RESPONSE, Constants.RESPONSE_FAILURE);
    });

    Utils.LHTLog('getNotificationListByQueryObj', 'end', {
        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
        data: {getNotificationListByQueryObjList: getNotificationListByQueryObjResponse}
    }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);


    if (!getNotificationListByQueryObjResponse || !getNotificationListByQueryObjResponse.length)
        Utils.respond(res, getNotificationListByQueryObjResponse, Constants.FAILED_TO_FETCHED_NOTIFICATION_LIST, Constants.RESPONSE_FAILURE);

    Utils.respond(res, getNotificationListByQueryObjResponse, Constants.NOTIFICATION_FETCHED_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);

});

exports.getNotificationUnreadCount = co.wrap(function* (req, res) {
    Utils.LHTLog('getNotificationUnreadCount', 'start', {
        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
        data: {request: req.body}
    }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    let getNotificationUnreadCountResponse = yield BLManager.getNotificationUnreadCount(req.body.queryObj, req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY]).catch(function (err) {

        Utils.LHTLog('getNotificationUnreadCount', 'end', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {getNotificationUnreadCount: getNotificationUnreadCountResponse}
        }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

        return Utils.respond(res, {}, err.message ? err.message : Constants.WEBSERVICE_ERROR_RESPONSE, Constants.RESPONSE_FAILURE);
    });

    Utils.LHTLog('getNotificationUnreadCount', 'end', {
        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
        data: {getNotificationUnreadCount: getNotificationUnreadCountResponse}
    }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);


    if (!getNotificationUnreadCountResponse || getNotificationUnreadCountResponse.count === undefined)
        Utils.respond(res, {}, Constants.FAILED_TO_FETCHED_NOTIFICATION_COUNT, Constants.RESPONSE_FAILURE);

    Utils.respond(res, getNotificationUnreadCountResponse, Constants.NOTIFICATION_COUNT_FETCHED_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);

});
exports.markBulkNotificationRead = co.wrap(function* (request, response) {
    Utils.LHTLog('markBulkNotificationRead', 'start:before update notification', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {request: request.body}
    }, "Vrinda", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    let markNotificationUnreadResponse = yield BLManager.markBulkNotificationUnread(request.body.notificationIDArray);

    Utils.LHTLog('markBulkNotificationRead', 'end:after update notification', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {markNotificationUnreadResponse: markNotificationUnreadResponse}
    }, "Vrinda", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    if (!markNotificationUnreadResponse)
        return Utils.respond(response, {}, Constants.NOTIFICATION_MARKED_UNREAD_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);
    /*get updated notification unread count*/
    let getNotificationUnreadCountResponse = yield BLManager.getNotificationUnreadCount(request.body.queryObj, request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY]).catch(function (err) {

        Utils.LHTLog('getNotificationUnreadCount', 'end', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {getNotificationUnreadCount: getNotificationUnreadCountResponse}
        }, "Vrinda", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

        return Utils.respond(response, {}, err.message ? err.message : Constants.WEBSERVICE_ERROR_RESPONSE, Constants.RESPONSE_FAILURE);
    });

    Utils.LHTLog('getNotificationUnreadCount', 'end', {
        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
        data: {getNotificationUnreadCount: getNotificationUnreadCountResponse}
    }, "Vrinda", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);


    if (!getNotificationUnreadCountResponse || getNotificationUnreadCountResponse.count === undefined)
        return Utils.respond(response, {}, Constants.FAILED_TO_FETCHED_NOTIFICATION_COUNT, Constants.RESPONSE_FAILURE);

    return Utils.respond(response, getNotificationUnreadCountResponse, Constants.NOTIFICATION_COUNT_FETCHED_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);

});
exports.markBulkNotificationCleared = co.wrap(function* (request, response) {
    Utils.LHTLog('markBulkNotificationCleared', 'start:before update notification', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {request: request.body}
    }, "Ayush", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    let markNotificationClearedResponse = yield BLManager.markBulkNotificationCleared(request.body.notificationIDArray);

    Utils.LHTLog('markBulkNotificationCleared', 'end:after update notification', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {markNotificationUnreadResponse: markNotificationClearedResponse}
    }, "Vrinda", request.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    if (!markNotificationClearedResponse)
        return Utils.respond(response, {}, Constants.NOTIFICATION_MARKED_CLEAR_FAILED, Constants.RESPONSE_CODE.INTERNAL_SERVER_ERROR);

    return Utils.respond(response, markNotificationClearedResponse, Constants.NOTIFICATION_MARKED_CLEAR_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);

});