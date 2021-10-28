/**
 * Created by Developer on 10/10/16.
 */

const mongoose = require('mongoose');

const Notification = mongoose.model('NS-Notification');
const NotificationLog = mongoose.model('NS-NotificationLog');

const co = require('co');
const Constants = require('../common/constants');
const Utils = require('../utils');
const SNS = require('../service/sns_service.js');
const MailService = require('../service/mail_service');
const SlackService = require('../service/slack_service');

module.exports = {

//    sendNotification:co.wrap(function*(notification){
    sendNotification: co.wrap(function*(notification) {

        //console.log("Send Notification"+notification);
        // var notification = new Notification();

        //notification.type = Constants.NOTIFICATION_TYPE_PUSH;
        //notification.postedTo = 'arn:aws:sns:REGION:547003453952:endpoint/GCM/WPT-Dev/26944f7c-e7f4-3ea0-94c0-8fd81cd7dfff';
        //notification.postedToDeviceType = 'android';
        //notification.isDelivered = false;
        //notification.title = 'Test';
        //notification.payload = 'Test';
        //notification.description = 'Testing';

        //notification.type = Constants.NOTIFICATION_TYPE_PUSH;
        //notification.postedTo = 'arn:aws:sns:REGION:547003453952:endpoint/APNS_SANDBOX/WPT-IOS-Dev/1b7a6f7f-6b81-381f-91c8-6142dded199a';
        //notification.postedToDeviceType = 'ios';
        //notification.isDelivered = false;
        //notification.title = 'Testing Push Notification';
        //notification.payload = "{'groupID':'ytyu1','imageURL':'google.com','eventID':'1232dsqdwqd'}";
        //notification.description = "test";

        var _this = this;
        switch (notification.type) {
            case Constants.NOTIFICATION_TYPE_PUSH:
                _this.sendPushNotification(notification);
                break;
            case Constants.NOTIFICATION_TYPE_SMS:
                _this.sendSMSNotification(notification);
                break;
            case Constants.NOTIFICATION_TYPE_EMAIL:
                _this.sendEmailNotification(notification);
                break;
            case Constants.NOTIFICATION_TYPE_SLACK:
                _this.sendSlackNotification(notification);
                break;
            default:
        }
        return true;
    }),

    sendPushNotification: co.wrap(function*(notification) {

        var _this = this;
        console.log("Send Push Objects" + notification);

        //Publish notification to device
        var snsPublishResponse = yield SNS.publish(notification).catch(function (err) {
            console.log(err.message);
        });

        console.log("SNS Publish Response " + snsPublishResponse);

        //Add SNS response to notification log
        notification.isDelivered = true;

        //Save notification logs
        var saveToNotificationLogResponse = yield _this.saveToNotificationLog(notification);
        var deleteNotificationResponse = yield _this.deleteNotification(notification);
    }),

    sendSMSNotification: co.wrap(function*(notification) {

        var _this = this;
        notification.isDelivered = true;

        var saveToNotificationLogResponse = yield _this.saveToNotificationLog(notification);
        var deleteNotificationResponse = yield _this.deleteNotification(notification);

    }),

    sendEmailNotification: co.wrap(function*(notification) {

        var _this = this;
        notification.isDelivered = true;
        console.log("step8");
        //for sending mail through elastic email
        var sendEmailResponse = yield MailService.sendEmail(notification.postedTo, notification.title, '', notification.description, notification.sentFromEmail, notification.sentFromName).catch(function (err) {
            console.log(err);
        });

        console.log('sendEmailResponse:-', sendEmailResponse);
        var saveToNotificationLogResponse = yield _this.saveToNotificationLog(notification);
        var deleteNotificationResponse = yield _this.deleteNotification(notification);

    }),
    sendSlackNotification: co.wrap(function*(notification) {
        //console.log("step 1");
        var _this = this;
        notification.isDelivered = true;

        //for sending mail through elastic email
        var sendSlackResponse = yield SlackService.sendSlack(notification).catch(function (err) {
            console.log(err);
        });
//TODO check sendSlackResponse
        console.log('sendSlackResponse:-', sendSlackResponse);
        var saveToNotificationLogResponse = yield _this.saveToNotificationLog(notification);
        var deleteNotificationResponse = yield _this.deleteNotification(notification);

    }),
    saveToNotificationLog: co.wrap(function*(notification) {

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

        // notificationLog.notificationResponse = notificationResponse;


        var saveToNotificationLogResposne = yield notificationLog.saveToNotificationLog();
        console.log(saveToNotificationLogResposne);
        return saveToNotificationLogResposne;

    }),
    deleteNotification: co.wrap(function*(notification) {
        var deleteNotificationResponse = yield Notification.deleteNotification(notification);
        return deleteNotificationResponse;

    })

}