/**
 * Created by deployment on 29/12/16.
 */

var https = require('https');
var querystring = require('querystring');
const Utils = require('../utils');
const Constants = require('../common/constants');
var MY_SLACK_WEBHOOK_URL = 'SLACK_URL';
//var MY_SLACK_WEBHOOK_URL = 'SLACK_URL';
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);
module.exports = {
    sendSlack
};


function sendSlack(notificationObject,requestID='0') {
    Utils.LHTLog('sendSlack','start',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{notificationObject:notificationObject}},"Manish",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);

    // Make sure to add your username and api_key below.
    var statLog = slack.extend({
        channel: notificationObject.postedTo,
        username: notificationObject.postedBy
    });

    statLog({
        //text: notificationObject.title,
        fields: {
            '': notificationObject.description
        }
    });

    slack.onError = function (err) {
        Utils.LHTLog('sendSlack','end',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{err:err}},"Manish",requestID,Constants.LOG_LEVEL_TYPE.ERROR,Constants.CURRENT_TIMESTAMP);
        return {success: false};

    };
    Utils.LHTLog('sendSlack','end',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{success: true}},"Manish",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);

    return {success: true};
}


//var statLog = slack.extend({
//    channel: '#statistics',
//    username: 'Statistics'
//});


//statLog({
//    text: 'Current server statistics',
//    fields: {
//        'CPU usage': '7.51%',
//        'Memory usage': '254mb'
//    }
//});