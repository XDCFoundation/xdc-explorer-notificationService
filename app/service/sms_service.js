/**
 * Created by Sanjeet on 16/02/17.
 */
const Config = require('../../config');
const plivo = require('plivo');
const twilio = require('twilio');
const Utils = require('../utils');
const Constants = require('../common/constants');
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: Config.AWS_ACCESS_KEY,
    secretAccessKey: Config.AWS_SECRET_KEY,
    region: Config.AWS_SNS_REGION
});
module.exports = {
    sendSMS: function (notificationObj, accountID, authToken, twilioPhoneNumber, requestID = '0') {
        let messageProvider = (notificationObj.messageProvider) ? notificationObj.messageProvider : Config.MESSAGE_PROVIDER;
        switch (messageProvider) {
            case Constants.SMS_SERVICE_PROVIDER.MSG91:
                return this.sendSMSByMsg91(notificationObj.postedTo, notificationObj.description);
            case Constants.SMS_SERVICE_PROVIDER.PLIVO:
                return this.sendSMSByPlivo(notificationObj.postedTo, notificationObj.description);
            case Constants.SMS_SERVICE_PROVIDER.TWILIO:
                return this.sendSMSByTwilio(notificationObj.postedTo, notificationObj.description)
            case Constants.SMS_SERVICE_PROVIDER.SNS:
                return this.sendSMSBySns(notificationObj.postedTo, notificationObj.description)

        }
    },
    sendSMSByTwilio: function (phoneNumber, message, requestID = '0') {
        Utils.LHTLog('sendSMS', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {
                phoneNumber: phoneNumber,
                message: message,
                accountID: Config.TWILIO_ACCOUNT_ID,
                authToken: Config.TWILIO_AUTH_TOKEN,
                twilioPhoneNumber: Config.TWILIO_PHONE_NUMBER
            }
        }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

        let client = twilio(Config.TWILIO_ACCOUNT_ID, Config.TWILIO_AUTH_TOKEN);
        return new Promise(function (resolve, reject) {
            //phoneNumber = "+PHONE_NUMBER";

            if (phoneNumber.length == 0) {
                Utils.LHTLog('sendSMS', 'end', {
                    type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                    data: {phoneNumber: phoneNumber}
                }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
                resolve(false);
            }
            // return resolve(true);
            client.sendMessage({

                to: phoneNumber,
                from: Config.TWILIO_PHONE_NUMBER,
                body: message

            }, function (err, responseData) {
                if (err) {
                    Utils.LHTLog('sendSMS', 'end', {
                        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                        data: {err: err}
                    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);

                    resolve(false);
                }
                Utils.LHTLog('sendSMS', 'end', {
                    type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                    data: {responseData: responseData}
                }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

                resolve(responseData);
            });
        });
    },
    sendSMSByPlivo: function (phoneNumber, message, requestID = 0) {
        Utils.LHTLog('sendSMSByPlivo', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {phoneNumber: phoneNumber, message: message}
        }, "Rahul", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

        let client = plivo.RestAPI({
            authId: Config.PLIVO_AUTH_ID,
            authToken: Config.PLIVO_AUTH_TOKEN
        });

        return new Promise(function (resolve, reject) {
            //phoneNumber = "+PHONE_NUMBER";

            if (phoneNumber.length == 0) {
                Utils.LHTLog('sendSMSByPlivo', 'end', {
                    type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                    data: {phoneNumber: phoneNumber}
                }, "Rahul", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
                resolve(false);
            }
            // return resolve(true);
            var params = {
                'src': Config.PLIVO_PHONE_NUMBER,
                'dst': `${Config.OTP_USER_COUNTRY_CODE}${phoneNumber}`,
                'text': message
            };
            console.log("sendSMSByPlivo", params);

            client.send_message(params, function (status, response) {

                console.log("plivo status", status);
                console.log("plivo response", response);
                if (status != '202') {
                    Utils.LHTLog('sendSMSByPlivo', 'end', {
                        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                        data: {err: status}
                    }, "Rahul", Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
                    resolve(true);
                }
                Utils.LHTLog('sendSMSByPlivo', 'end', {
                    type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                    data: {responseData: response}
                }, "Rahul", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
                resolve(false);
            });
        });
    },
    sendSMSByMsg91: function (phoneNumber, message, requestID = 0) {
        Utils.LHTLog('sendSMSByMsg91', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {phoneNumber: phoneNumber, message: message}
        }, "Rahul", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

        let msgService91 = require("msg91")(Config.MSG91_API_KEY, Config.MSG91_SENDER_ID, Config.MSG91_ROUTE_NO);

        return new Promise(function (resolve, reject) {
            if (phoneNumber.length == 0) {
                Utils.LHTLog('sendSMSByMsg91', 'end', {
                    type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                    data: {phoneNumber: phoneNumber}
                }, "Rahul", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
                reject(true);
            }
            var params = {
                'dst': `${Config.OTP_USER_COUNTRY_CODE}${phoneNumber}`,
                'text': message
            };
            console.log("sendSMSByMsg91", params)
            msgService91.send(params.dst, params.text, function (err, response) {
                if (err) {
                    Utils.LHTLog('sendSMSByMsg91', 'end', {
                        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                        data: {err: err}
                    }, "Rahul", Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
                    resolve(true);
                }
                Utils.LHTLog('sendSMSByMsg91', 'end', {
                    type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                    data: {responseData: response}
                }, "Rahul", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
                resolve(false);
            });
        });
    },
    sendSMSBySns: function (phoneNumber, message, requestID = 0) {
        Utils.LHTLog('sendSMSBySns', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: {phoneNumber: phoneNumber, message: message}
        }, "Jyot", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

        // let msgService91 = require("sendSMSBySns")(Config.MSG91_API_KEY, Config.MSG91_SENDER_ID, Config.MSG91_ROUTE_NO);

        return new Promise(function (resolve, reject) {
            if (phoneNumber.length == 0) {
                Utils.LHTLog('sendSMSBySns', 'end', {
                    type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                    data: {phoneNumber: phoneNumber}
                }, "Jyot", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
                reject(true);
            }
            var params = {
                PhoneNumber: `${phoneNumber}`,
                Message: message
            };
            console.log("sendSMSBySns", params)
// Create promise and SNS service object
            let setSMSTypePromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

// Handle promise's fulfilled/rejected states
            setSMSTypePromise.then(
                function (response) {
                    Utils.LHTLog('sendSMSByMsg91', 'end', {
                        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                        data: {responseData: response}
                    }, "Jyot", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
                    resolve(false);
                    console.log("sns response",response)
                }).catch(
                function (err) {
                    Utils.LHTLog('sendSMSBySns', 'end', {
                        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                        data: {err: err}
                    }, "Jyot", Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
                    resolve(true);
                    console.error(err, err.stack);
                });
        });
    }
};