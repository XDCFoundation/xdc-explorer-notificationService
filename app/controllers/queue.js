/**
 * Created by deployment on 23/02/17.
 */
'use strict';
const Constants = require('../common/constants');
const Config = require('../../config/');
var PushNotificationBLManager = require("../managers/push_notification_bl_manager.js");
const AmqpClientLib = require('../../LHTRabbitMqClientLibrary/index');
const QueueBLManager = require("../managers/queue_bl_manager");
const Utils = require('../utils');
const mongoose = require('mongoose');
const Notifications = mongoose.model('NS-Notification');
const uuid = require('uuid');
var co = require('co');

module.exports = {
    notification: function (requestID = '0') {
        // QueueBLManager.sendNotification(notificationObject)
        getNotificationData(requestID);
        if (Config.UPDATE_NOTIFICATION_EXCHANGE)
            updateNotificationData(requestID);
    }
};

var getNotificationData = co.wrap(function* (requestID = '0') {
    Utils.LHTLog('getNotificationData', 'start', {
        type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
        data: {}
    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    try {
        var msgResponse = yield AmqpClientLib.getFromQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, Constants.EXCHANGE_TYPE_FANOUT, Constants.PUBLISHER_SUBSCRIBER_QUEUE, notificationCallback, {}, {});
        if (msgResponse != undefined)
            console.log("step1", msgResponse);
    } catch (err) {
        console.log(err);
        return;
    }
    Utils.LHTLog('getNotificationData', 'end', {
        type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
        data: {}
    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

})

var notificationCallback = co.wrap(function* (err, data) {
    let requestID = uuid.v1();
    Utils.LHTLog('notificationCallback', 'start', {
        type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
        data: {Error: err, response: data}
    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    if (data == null) {
        Utils.LHTLog('notificationCallback', 'end', {
            type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
            data: {Error: err, response: data}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        return;
    } else {
        try {
            var notificationObject = yield JSON.parse(data);
            console.log("step2");
        } catch (err) {
            Utils.LHTLog('notificationCallback', 'end', {
                type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
                data: {Error: err}
            }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
            return;
        }
        sendNotification(notificationObject, requestID);
    }
});

var sendNotification = function (notificationObject, requestID = '0') {
     //yield PushNotificationBLManager.addToNotifications(notificationObject);
    console.log("step3");
    addNotificationToDatabase(notificationObject, requestID);
};

var addNotificationToDatabase = co.wrap(function* (notificationObject, requestID = '0') {
    Utils.LHTLog('addNotificationToDatabase', 'start', {
        type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
        data: {notificationObject: notificationObject}
    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.VERBOSE, Constants.CURRENT_TIMESTAMP);

    var notification = new Notifications(notificationObject);

    var payload = notification.payload;

    if (typeof payload == 'string') {
        try {
            payload = JSON.parse(notification.payload);
            if (payload.notificationID !== undefined)
                payload.notificationID = notification._id;
            payload = JSON.stringify(payload);
        }
        catch (err) {
            Utils.LHTLog('addNotificationToDatabase', 'error', {
                type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
                data: {err: err}
            }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.WARN, Constants.CURRENT_TIMESTAMP);
        }
    }
    notification.payload = payload;

    notification.addedOn = (new Date).getTime();
    notification.modifiedOn = (new Date).getTime();
    Utils.LHTLog('addNotificationToDatabase', 'before save notification', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {notification: notification}
    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

    let notificationResponse = yield PushNotificationBLManager.addToNotifications(notification);
    Utils.LHTLog('addNotificationToDatabase', 'after save notification', {
        type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
        data: {}
    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

    if (notificationObject.isSendPush === undefined || notificationObject.isSendPush === true) {

       notificationResponse.getDeviceQueryObj = notificationObject.getDeviceQueryObj === undefined ? null : notificationObject.getDeviceQueryObj

        Promise.resolve(QueueBLManager.sendNotification(notificationResponse, requestID));
    }

});

/*function callback(message) {

 var notificationObject = JSON.parse(message);

 PushNotificationBLManager.addToNotifications(notificationObject);

 QueueBLManager.sendNotification(notificationObject);

 }*/
//Connection.then(function (conn) {
//    return conn.createChannel();
//}).then(function (ch) {
//    return ch.assertExchange(exchange, 'fanout', {durable: true}).then(function (res) {
//        return ch.assertQueue(Queue, {exclusive: false}).then(function (q) {
//            ch.bindQueue(q.queue, exchange, '', {persistent: true});
//            var consumed = ch.consume(q.queue, function (msg) {
//
//                if (msg !== null) {
//                    //console.log(msg.content.toString());
//
//                    var notificationObject = JSON.parse(msg.content.toString());
//                    /*save notifications*/
//                     //PushNotificationBLManager.addToNotifications(notificationObject);
//                    /*to send notifications*/
//                    QueueBLManager.sendNotification(notificationObject);
//                        console.log("sent");
//
//
//                }
//
//            },{noAck:true});
//
//        });
//
//    });
//
//}).catch(console.warn);
var updateNotificationData=co.wrap(function* (requestID='0'){
    Utils.LHTLog('updateNotificationData','start',{
        type:Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
        data:{}
    },"Nishant",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
    try{
        let msgRes= yield AmqpClientLib.getFromQueue(Config.UPDATE_NOTIFICATION_EXCHANGE, Config.UPDATE_NOTIFICATION_QUEUE, Constants.EXCHANGE_TYPE_FANOUT, Constants.PUBLISHER_SUBSCRIBER_QUEUE, updateNotificationCallback, {}, {});

    }catch (err) {
        console.log(err);
        return;
    }
    Utils.LHTLog('updateNotificationData', 'end', {
        type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
        data: {}
    }, "Nishant", requestID, Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);


});
var updateNotificationCallback=co.wrap(function* (err,data) {
    let requestID=uuid.v1();
    Utils.LHTLog('updateNotificationCallback', 'start', {
        type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
        data: {Error: err, response: data}
    }, "Nishant", requestID, Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

    if (data == null) {
        Utils.LHTLog('notificationCallback', 'end', {
            type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
            data: {Error: err, response: data}
        }, "Nishant", requestID, Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        return;
    } else {
        try {
            var notificationObject = yield JSON.parse(data);
            updateNotification(notificationObject.query,requestID);
            updateNotificationPush(notificationObject,requestID);
        } catch (err) {
            Utils.LHTLog('updateNotificationCallback', 'end', {
                type: Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,
                data: {Error: err}
            }, "Nishant", requestID, Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
            return;
        }

    };
});
var updateNotification=co.wrap(function*(query,requestID) {

 let response= yield QueueBLManager.updateNotificationDetails(query);
 console.log(response);


});

var updateNotificationPush=co.wrap(function*(notificationObject,requestID){

    if (notificationObject.isSendPush === undefined || notificationObject.isSendPush === true)
    {
        Promise.resolve(QueueBLManager.sendNotification(notificationObject, requestID));
    }

});