'use strict';
const AWS = require('aws-sdk');
const co = require('co');
const Config = require('../../config');
const Utils = require('../utils');
const Constants = require('../common/constants');
const FCM = require('fcm-node');


AWS.config.update({accessKeyId: Config.AWS_ACCESS_KEY, secretAccessKey: Config.AWS_SECRET_KEY});
AWS.config.update({region: Config.AWS_SNS_REGION});


module.exports = {

    //createARN: co.wrap(function*(deviceToken) {
    //
    //    var sns = new AWS.SNS();
    //
    //    var params = {
    //        PlatformApplicationArn: 'arn:aws:sns:us-east-1:335859319421:app/GCM/Wizard-Testing',
    //        Token: DEVICE_TOKEN,
    //
    //    };
    //
    //    sns.createPlatformEndpoint(params, function (err, data) {
    //        if (err) {
    //            console.log(err);
    //            return err;
    //        } else {
    //            // console.log(data);
    //            return data;
    //        }
    //    });
    //
    //},
    publish: co.wrap(function* (notification, requestID = '0') {
        switch (Config.PUSH_NOTIFICATION_PROVIDER) {
            case Constants.PUSH_NOTIFICATION_PROVIDER.FCM:
                return this.fcmPublish(notification, requestID);
            case Constants.PUSH_NOTIFICATION_PROVIDER.SNS:
                return this.snsPublish(notification, requestID);
        }
    }),

    snsPublish: co.wrap(function* (notification, requestID = '0') {
        Utils.LHTLog('publish', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {notification: notification}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

        var sns = new AWS.SNS();
        var payload = {};
        if (notification.postedToDeviceType == Constants.DEVICE_TYPE_ANDROID) {

            payload = {
                default: notification.title,
                GCM: {
                    data: {
                        message: notification.description,
                        title: notification.title,
                        extra: JSON.parse(notification.payload)
                    }
                }
            };
            payload.GCM = JSON.stringify(payload.GCM);
            payload = JSON.stringify(payload);

            console.log("PayLoad GCM" + payload);
        }
        else if (notification.postedToDeviceType.toLowerCase() == Constants.DEVICE_TYPE_IOS) {
            if (Config.IS_FOR_SANDBOX.toString() === 'true') {
                payload = {
                    //default: notification.title,
                    APNS_SANDBOX: {
                        aps: {
                            alert: {
                                title: notification.title,
                                body: notification.description
                            },
                            message: notification.description,
                            "content-available": 0
                        },
                        payload: JSON.parse(notification.payload)
                    }
                };

                payload.APNS_SANDBOX = JSON.stringify(payload.APNS_SANDBOX);
                payload = JSON.stringify(payload);
            }
            else {

                //Production SNS Payload
                payload = {
                    //default: notification.title,
                    APNS: {
                        aps: {
                            alert: {
                                title: notification.title,
                                body: notification.description
                            },
                            message: notification.description,
                            "content-available": 0
                        },
                        payload: JSON.parse(notification.payload)
                    }
                };
                payload.APNS = JSON.stringify(payload.APNS);
                payload = JSON.stringify(payload);
            }
        }
        // The key to the whole thing is this
        var params = {
            Message: payload,
            MessageStructure: 'json',
            TargetArn: notification.postedTo
        };

        return new Promise(function (resolve, reject) {
            sns.publish(params, function (err, responseData) {
                if (err) {
                    Utils.LHTLog('publish', 'end', {
                        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                        data: {err: err}
                    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
                    reject(err);
                } else {
                    Utils.LHTLog('publish', 'end', {
                        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                        data: {responseData: responseData}
                    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
                    resolve(responseData);
                }
            });

        });
    }),

    fcmPublish: co.wrap(function* (notification, requestID = '0') {
        Utils.LHTLog('publish', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {notification: notification}
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);


        let serverKey = Config.FCM_SERVER_KEY; //put your server key here
        let fcm = new FCM(serverKey);

        let message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: notification.postedTo,
            priority: 'high',
            content_available: true,
            notification: {
                title: notification.title,
                body: notification.description,
                sound: "default",
                show_in_foreground: true
            },
            data: {
                payload: notification.payload
            }
        };
        if (notification.payload && notification.payload.icon) {
            message.notification['icon'] = notification.payload.click_action;
            message['webpush'] = {
                "headers": {"Urgency": "high"},
                "notification": {
                    "body": notification.description, "requireInteraction": "true", "icon": notification.payload.icon
                }
            }
        }
        if (notification.payload && notification.payload.click_action)
            message.notification['click_action'] = notification.payload.click_action;
        return new Promise(function (resolve, reject) {
            fcm.send(message, function (err, responseData) {
                if (err) {
                    console.log(err)
                    Utils.LHTLog('publish', 'end', {
                        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                        data: {err: err}
                    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
                    reject(err);
                } else {
                    console.log(responseData)
                    Utils.LHTLog('publish', 'end', {
                        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                        data: {responseData: responseData}
                    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
                    resolve(responseData);
                }
            });

        });
    })
};

/*sendPush: function(arn, message, callback) {



 var sns = new AWS.SNS();

 var params = {
 Message: message,
 //MessageAttributes: {
 //    someKey: {
 //        DataType: 'STRING_VALUE',
 //        BinaryValue: new Buffer('...') || 'STRING_VALUE',
 //        StringValue: 'STRING_VALUE'
 //    }
 //},
 MessageStructure: 'STRING_VALUE',
 TargetArn: arn

 };

 sns.publish(params, function(err, responseData) {
 if (err) {
 console.log(err);
 callback(false);
 } else {
 console.log(responseData);
 callback(responseData);
 }
 });
 }*/


//function save(records, Model, match) {
//    match = match || 'id';
//    return new Promise(function (resolve, reject) {
//        var bulk = Model.collection.initializeUnorderedBulkOp();
//        records.forEach(function (record) {
//            var query = {};
//            query[match] = record[match];
//            console.log(query);
//            bulk.find(query).upsert().updateOne({
//                'keyword': record.keyword,
//                'type': record.type,
//                'clientObj': record.clientObj
//            });
//        });
//        bulk.execute(function (err, bulkres) {
//            if (err) return reject(err);
//            resolve(bulkres);
//        });
//    });
//}
