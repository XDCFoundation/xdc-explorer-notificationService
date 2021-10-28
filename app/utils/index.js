/**
 * Created by jayeshc on 8/25/16.
 */
const Constants = require('../common/constants');
const CONFIG = require('../../config/index');
const HttpService = require('../service/http-service');
var querystring = require('querystring');
var https = require('https');
var lhtLog = require('../../LHTLogLibrary/index');
module.exports = {
    respond,
    respondWithArray,
    getErrorModel,
    getErrorModelWithErrorCode,
    respondWithCode,
    LHTWebLogs,
    LHTLog,
    sendNotificationToZapier
};

function respond(res, data, message, success) {
    res.format({
        json: () => {
            var messageObj = {
                "param": "",
                "msg": message
            };
            var messages = [messageObj];
            var responseObj = {
                responseData: data,
                message: messages,
                success: success
            };
            res.json(responseObj);
        }
    });
}

function respondWithCode(res, data, message, success, code) {
    res.format({
        json: () => {
            var messageObj = {
                "param": "",
                "msg": message,
                "errorCode": code
            };
            var messages = [messageObj];
            var responseObj = {
                responseData: data,
                message: messages,
                success: success
            };
            res.json(responseObj);
        }
    });
}

function respondWithArray(res, data, message, success) {
    res.format({
        json: () => {

            var responseObj = {
                responseData: data,
                message: message,
                success: success
            };
            res.json(responseObj);
        }
    });
}

function LHTWebLogs(messageText, message) {
    console.log(messageText, message);
}

function getErrorModel(obj, message) {
    return {message: message, data: obj}
}

function getErrorModelWithErrorCode(obj, message, errorCode) {
    return {message: message, data: obj, errCode: errorCode}
}

/**
 *
 * @param functionName
 * @param message
 * @param payload:should be in object form
 * @param developerAlias
 * @param requestID
 * @param type
 * @param timestamp
 * @constructor
 */
function LHTLog(functionName, message, payload, developerAlias, requestID = '', type = 'info', timestamp = (new Date()).getTime()) {
    if (CONFIG && CONFIG.IS_LOG_ENABLE === "true") {
        lhtLog.LHTWeblogs(message, payload, functionName, Constants.SERVICE_NAME, developerAlias, requestID, type, timestamp);
   }
    // console.log('\nserviceName:' + Constants.SERVICE_NAME + '\nfunctionName:' + functionName + '\nmessage:' + message + '\npayload:' + payload + '\ndeveloperAlias:' + developerAlias + '\nrequestID:' + requestID + '\ntype:' + type + '\ntimestamp:' + timestamp);
    //writeStream.write('functionName:'+functionName+'message:'+ message+'payload:'+ payload+'developerAlias:'+ developerAlias+'requestID:'+requestID+'type:'+type+'timestamp:'+timestamp)
}

function sendNotificationToZapier(payload, zapierUrl) {
    if (!payload || !zapierUrl)
        return;
    return HttpService.executeHttpRequestWithRQ(Constants.METHOD_TYPE.POST, zapierUrl, '', payload, Constants.HTTP.HEADER_TYPE.APPLICATION_JSON);
}