/**
 * Created by Developer on 10/10/16.
 */
const mongoose = require('mongoose');
const Notification = mongoose.model('NS-Notification');
const NotificationLog = mongoose.model('NS-NotificationLog');
const co = require('co');
const Constants = require('../common/constants');
const Config = require('../../config/index');
const Utils = require('../utils');
const SNS = require('../service/sns_service.js');
const MailService = require('../service/mail_service');
const SlackService = require('../service/slack_service');
const SMSService = require('../service/sms_service');
const HttpService = require('../service/http-service');
if (Config.IS_TO_FETCH_TOKEN_FROM_FIREBASE && Config.IS_TO_FETCH_TOKEN_FROM_FIREBASE == 'true') {

    var admin = require('firebase-admin');
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: Config.FIREBASE_PROJECT_ID,
            clientEmail: Config.FIREBASE_CLIENT_EMAIL,
            privateKey: Config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        databaseURL: Config.FIREBASE_DB_URL
    });
}

module.exports = {
    sendNotification: co.wrap(function* (notification, requestID = '0') {
        Utils.LHTLog('sendNotification', 'start', {
            type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
            data: {notification: notification}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
console.log("step4")
        var _this = this;
        switch (notification.type) {
            case Constants.NOTIFICATION_TYPE_PUSH:
                if (Config.IS_TO_FETCH_TOKEN_FROM_FIREBASE && Config.IS_TO_FETCH_TOKEN_FROM_FIREBASE == 'true')
                    _this.getTokenAndSendPushNotification(notification, requestID);
                else if (!notification.getDeviceQueryObj)
                    _this.sendPushNotification(notification, requestID);
                else _this.getDevicesForPushNotification(notification, requestID);
                break;
            case Constants.NOTIFICATION_TYPE_SMS:
                _this.sendSMSNotification(notification, requestID);
                break;
            case Constants.NOTIFICATION_TYPE_EMAIL:
                _this.sendEmailNotification(notification, requestID);
                break;
            case Constants.NOTIFICATION_TYPE_SLACK:
                _this.sendSlackNotification(notification, requestID);
                break;
            default:
        }
        Utils.LHTLog('sendNotification', 'end', {
            type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
            data: {returnValue: true}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        return true;
    }),
    getDevicesForPushNotification: co.wrap(function* (notification, requestID = '0') {
        if (!notification || !notification.getDeviceQueryObj) {
            return false;
        }

        let userDeviceDetails = yield HttpService.executeHttpRequestWithRQ(Constants.METHOD_TYPE.POST, Config.USER_SERVICE_BASE_URL, Constants.PATHS.GET_ALL_LOGIN_DEVICE, notification.getDeviceQueryObj);

        if (!userDeviceDetails || !userDeviceDetails.success || !userDeviceDetails.responseData || !userDeviceDetails.responseData.length) {
            Utils.LHTLog('getDevicesForPushNotification', 'no user devices found', {
                type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
                data: {userDeviceDetails: userDeviceDetails}
            }, "Vrinda", requestID, Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return false;
        }
        for (let userDeviceIndex = 0; userDeviceIndex < userDeviceDetails.responseData.length; userDeviceIndex++) {
            if (userDeviceDetails.responseData[userDeviceIndex].deviceType === 'web')
                continue;
            notification.postedTo = userDeviceDetails.responseData[userDeviceIndex].arn;
            if (Config.PUSH_NOTIFICATION_PROVIDER && Config.PUSH_NOTIFICATION_PROVIDER === Constants.PUSH_NOTIFICATION_PROVIDER.FCM)
                notification.postedTo = userDeviceDetails.responseData[userDeviceIndex].pushToken;
            notification.postedToDeviceType = userDeviceDetails.responseData[userDeviceIndex].deviceType;
            this.sendPushNotification(notification, requestID);
        }
    }),
    getTokenAndSendPushNotification: co.wrap(function* (notification, requestID = '0') {
        if (!notification) {
            return false;
        }
        console.log("hi")
        let snapshot;
        if(notification.userID) {
            snapshot = yield admin.database().ref('users/' + notification.userID).once('value');
            if (!snapshot || !snapshot.val() || !snapshot.val().pushToken)
                return false;
        }
        else if(notification.getDeviceQueryObj){
            snapshot = yield admin.database().ref('users').orderByChild(notification.getDeviceQueryObj.key).equalTo(notification.getDeviceQueryObj.value).once('value');
            if (!snapshot || !snapshot.val())
                return false;
        }
        if(!snapshot)
            return false;
        snapshot=Object.values(snapshot.val());
        var pushToken = snapshot[0].pushToken;
        console.log("hi11")
        console.log(pushToken)
        if (typeof pushToken == 'string') {
            notification.postedTo = pushToken;
            this.sendPushNotification(notification, requestID);
        }
        else if (Array.isArray(pushToken)) {
            for (let pushTokenIndex = 0; pushTokenIndex < pushToken.length; pushTokenIndex++) {
                notification.postedTo = pushToken[pushTokenIndex];
                this.sendPushNotification(notification, requestID);
            }
        }
    }),
    sendPushNotification: co.wrap(function* (notification, requestID = '0') {
        Utils.LHTLog('sendPushNotification', 'start', {
            type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
            data: {notification: notification}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);


        var _this = this;
        //Publish notification to device
        var snsPublishResponse = yield SNS.publish(notification, requestID).catch(function (err) {
            console.log(err)
            Utils.LHTLog('sendPushNotification', 'error', {
                type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
                data: {err: err}
            }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.WARN, Constants.CURRENT_TIMESTAMP);
        });
        console.log(snsPublishResponse)
        //Add SNS response to notification log
        notification.isDelivered = true;
        //Save notification logs
        Utils.LHTLog('sendPushNotification', 'before save notificationlog', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {notification: notification}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        var saveToNotificationLogResponse = yield _this.saveToNotificationLog(notification, snsPublishResponse);
        Utils.LHTLog('sendPushNotification', 'end:after save notificationlog', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {saveToNotificationLogResponse: saveToNotificationLogResponse}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
    }),

    sendSMSNotification: co.wrap(function* (notification, requestID = '0') {
        Utils.LHTLog('sendSMSNotification', 'start', {
            type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
            data: {notification: notification}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

        let _this = this;
        if (!notification) {
            Utils.LHTLog('sendSMSNotification', 'end', {
                type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
                data: {notification: notification}
            }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
            return Promise.resolve(false);
        }
        let sendSmsResponse = yield SMSService.sendSMS(notification, requestID).catch(function (error) {
            Utils.LHTLog('sendSMSNotification', 'error', {
                type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
                data: {error: error}
            }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.WARN, Constants.CURRENT_TIMESTAMP);
        });
        if (!sendSmsResponse)
            notification.isDelivered = false;
        else
            notification.isDelivered = true;
        let zapPayload = {
            phoneNumber: notification.postedTo,
            message: notification.description,
            msgDelivered: notification.isDelivered
        };
        Utils.sendNotificationToZapier(zapPayload, Config.SMS_NOTIFICATION_ZAP_URL);

        Utils.LHTLog('sendSMSNotification', 'before save notificationlog', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {notification: notification}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        var saveToNotificationLogResponse = yield _this.saveToNotificationLog(notification, sendSmsResponse);
        Utils.LHTLog('sendSMSNotification', 'after save notificationlog:before delete notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {saveToNotificationLogResponse: saveToNotificationLogResponse}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        var deleteNotificationResponse = yield _this.deleteNotification(notification);
        Utils.LHTLog('sendSMSNotification', 'end:after delete notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {notification: notification, deleteNotificationResponse: deleteNotificationResponse}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
    }),

    sendEmailNotification: co.wrap(function* (notification, requestID = '0') {
        Utils.LHTLog('sendEmailNotification', 'start', {
            type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
            data: {notification: notification}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

        var _this = this;
        notification.isDelivered = true;

        //for sending mail through elastic email
        var sendEmailResponse = yield MailService.sendEmail(notification.postedTo, notification.title, '', notification.description, notification.sentFromEmail, notification.sentFromName, requestID).catch(function (err) {
            Utils.LHTLog('sendEmailNotification', 'error', {
                type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
                data: {err: err}
            }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.WARN, Constants.CURRENT_TIMESTAMP);

        });
        Utils.LHTLog('sendEmailNotification', 'before save notificationlog', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {notification: notification}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        var saveToNotificationLogResponse = yield _this.saveToNotificationLog(notification, sendEmailResponse);
        Utils.LHTLog('sendEmailNotification', 'after save notificationlog:before delete notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {saveToNotificationLogResponse: saveToNotificationLogResponse}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        var deleteNotificationResponse = yield _this.deleteNotification(notification);
        Utils.LHTLog('sendEmailNotification', 'end:after delete notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {notification: notification, deleteNotificationResponse: deleteNotificationResponse}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
    }),

    sendSlackNotification: co.wrap(function* (notification, requestID = '0') {
        Utils.LHTLog('sendSlackNotification', 'start', {
            type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
            data: {notification: notification}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

        var _this = this;
        notification.isDelivered = true;

        //for sending mail through elastic email
        var sendSlackResponse = yield SlackService.sendSlack(notification, requestID);
        //TODO check sendSlackResponse

        Utils.LHTLog('sendSlackNotification', 'before save notificationlog', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {notification: notification}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        var saveToNotificationLogResponse = yield _this.saveToNotificationLog(notification, sendSlackResponse);
        Utils.LHTLog('sendSlackNotification', 'after save notificationlog:before delete notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {saveToNotificationLogResponse: saveToNotificationLogResponse}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        var deleteNotificationResponse = yield _this.deleteNotification(notification);
        Utils.LHTLog('sendSlackNotification', 'end:after delete notification', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: {notification: notification, deleteNotificationResponse: deleteNotificationResponse}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

    }),

    saveToNotificationLog: co.wrap(function* (notification, notificationResponse) {
        var notificationLog = new NotificationLog();
        notificationLog.notificationID = notification._id;
        notificationLog.title = notification.title;
        notificationLog.payload = notification.payload;
        notificationLog.description = notification.description;
        notificationLog.postedBy = notification.postedBy;
        notificationLog.postedTo = notification.postedTo;
        notificationLog.postedToDeviceType = notification.postedToDeviceType;
        notificationLog.isDelivered = notification.isDelivered;
        notificationLog.priority = notification.priority;
        notificationLog.sentFromEmail = notification.sentFromEmail;
        notificationLog.sentFromName = notification.sentFromName;
        notificationLog.type = notification.type;
        notificationLog.notificationResponse = notificationResponse;
        var saveToNotificationLogResponse = yield notificationLog.saveToNotificationLog();
        return saveToNotificationLogResponse;
    }),

    deleteNotification: co.wrap(function* (notification) {
        var deleteNotificationResponse = yield Notification.deleteNotification(notification);
        return deleteNotificationResponse;
    }),

    updateNotificationDetails: co.wrap(function* (query) {
        let notificationObject = yield Notification.updateAllByObject(query.find, query.update);
        return notificationObject
    })


};