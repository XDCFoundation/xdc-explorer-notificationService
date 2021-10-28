'use strict';
const mongoose = require('mongoose');
const Notification = mongoose.model('NS-Notification');
const NotificationLog = mongoose.model('NS-NotificationLog');
const co = require('co');
const Constants = require('../common/constants');
const Utils = require('../utils');

module.exports = {

    addToNotifications: co.wrap(function* (notificationObject) {

        var addToNotificationResponse = yield notificationObject.saveNotification();

        if (addToNotificationResponse._id) {
            return Promise.resolve(addToNotificationResponse);
        } else
            return Promise.resolve({});
    }),

    addNotificationList: co.wrap(function* (notificationList) {
        var addNotificationListResponse = yield  Notification.saveNotificationList(notificationList);
        if (addNotificationListResponse.length > 0) {
            return yield Promise.resolve(addNotificationListResponse);
        } else
            return yield Promise.resolve([]);
    }),

    getNotificationList: co.wrap(function* (notificationObject, requestID = '0') {
        Utils.LHTLog('getNotificationList:BLManager', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {notificationObject: notificationObject}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.VERBOSE, Constants.CURRENT_TIMESTAMP);

        var getAllNotificationObj = {};
        var getAllUnreadNotificationObj = {};
        if (notificationObject.notificationFor == "All") {
            getAllNotificationObj = {
                userID: notificationObject.userID,
                entityID: notificationObject.entityID
            };

            getAllUnreadNotificationObj = {
                userID: notificationObject.userID,
                entityID: notificationObject.entityID,
                isRead: false
            };
        } else {
            getAllNotificationObj = {
                userID: notificationObject.userID,
                notificationFor: notificationObject.notificationFor,
                entityID: notificationObject.entityID
            };

            getAllUnreadNotificationObj = {
                userID: notificationObject.userID,
                notificationFor: notificationObject.notificationFor,
                entityID: notificationObject.entityID,
                isRead: false
            };
        }
        Utils.LHTLog('getNotificationList:BLManager', 'before find notifications', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {getAllNotificationObj: getAllNotificationObj}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        var getNotificationListResponse = yield  Notification.findAllByObject(getAllNotificationObj);
        Utils.LHTLog('getNotificationList:BLManager', 'after find notifications:before find unread notifications', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {getNotificationListResponse: getNotificationListResponse}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        var getUnreadNotificationsResponse = yield  Notification.findAllByObject(getAllUnreadNotificationObj);
        Utils.LHTLog('getNotificationList:BLManager', 'after find unread notifications', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {
                getAllUnreadNotificationObj: getAllUnreadNotificationObj,
                getUnreadNotificationsResponse: getUnreadNotificationsResponse
            }
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

        var response = {
            notifications: getNotificationListResponse,
            unreadCount: getUnreadNotificationsResponse.length
        };
        Utils.LHTLog('getNotificationList:BLManager', 'end', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {response: response}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.VERBOSE, Constants.CURRENT_TIMESTAMP);

        return yield Promise.resolve(response);
    }),

    getNotificationByQueryObj: co.wrap(function* (requestObj) {
        if (!requestObj || !Object.keys(requestObj).length || !requestObj.queryObj || !Object.keys(requestObj.queryObj).length)
            return {
                message: Constants.INVALID_REQUEST
            };
        let sortKey = requestObj.sortKey || '-addedOn';
        return yield Notification.findByQueryObj(requestObj.queryObj, requestObj.selectionString, sortKey);
    }),
    markNotificationRead: co.wrap(function* (notificationObject) {
        let findObj = {
            _id: notificationObject._id
        };
        let updateObj = {
            $set: {
                isRead: true
            }
        };

        var updateNotificationResponse = yield  Notification.updateAllByObject(findObj, updateObj);
        if (updateNotificationResponse.nModified == 0)
            return yield Promise.resolve(false);

        return yield Promise.resolve(findObj);
    }),

    markAllNotificationRead: co.wrap(function* (notificationObject) {
        var findObj = {
            userID: notificationObject.userID,
            notificationFor: notificationObject.notificationFor,
            entityID: notificationObject.entityID
        };
        var updateObj = {
            isRead: true
        };

        var updateNotificationResponse = yield  Notification.updateAllByObject(findObj, updateObj);
        if (updateNotificationResponse.nModified == 0)
            return yield Promise.resolve(false);

        return yield Promise.resolve(findObj);
    }),

    markAllNotificationReadByQueryObj: co.wrap(function* (queryObj) {
        var updateObj = {
            isRead: true
        };
        var updateNotificationResponse = yield  Notification.updateAllByObject(queryObj, updateObj);
        if (updateNotificationResponse.nModified == 0)
            return yield Promise.resolve(false);

        return yield Promise.resolve(updateNotificationResponse);
    }),

    markNotificationUnread: co.wrap(function* (notificationObject) {
        var findObj = {
            _id: notificationObject._id
        };
        var updateObj = {
            isRead: false
        };

        var updateNotificationResponse = yield  Notification.updateAllByObject(findObj, updateObj);
        if (updateNotificationResponse.nModified == 0)
            return yield Promise.resolve(false);

        return yield Promise.resolve(findObj);
    }),
    markBulkNotificationUnread: co.wrap(function* (notificationIDArray) {
        let findObj = {
            isRead: false,
            _id: {$in: notificationIDArray}
        };
        let updateObj = {
            $set: {isRead: true}
        };

        return yield  Notification.updateAllByObject(findObj, updateObj);

    }),
    markBulkNotificationCleared: co.wrap(function* (notificationIDArray) {
        let findObj = {
            isCleared: false,
            _id: {$in: notificationIDArray}
        };
        let updateObj = {
            $set: {isCleared: true}
        };

        return yield  Notification.updateAllByObject(findObj, updateObj);

    }),
    getNotificationUnreadCount: co.wrap(function* (queryObj) {
        if (!queryObj || !Object.keys(queryObj).length)
            return {
                message: Constants.INVALID_REQUEST
            };
        let notificationUnreadCount = yield Notification.getNotificationUnreadCount(queryObj);
        if (notificationUnreadCount === undefined)
            return false;
        return {
            count: notificationUnreadCount
        }
    })
};