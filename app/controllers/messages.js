'use strict';
const Constants = require('../common/constants');
const co = require('co');
const QueueBLManager = require("../managers/queue_bl_manager");
const Utils = require('../utils');

module.exports = {
    sendBulkMessage: co.wrap(function *(req, res) {
        if (!req.body) {
            Utils.LHTLog('sendBulkMessage', 'Invalid Request', "", "Rahul", "", Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
            return Utils.respond(res, {}, Constants.INVALID_REQUEST, Constants.RESPONSE_FAILURE);
        }
        let bulkMsgRequest = req.body;
        if (!bulkMsgRequest || Object.keys(bulkMsgRequest).length<1 || bulkMsgRequest.phone.length < 1 || !bulkMsgRequest.type || !bulkMsgRequest.message) {
            Utils.LHTLog('sendBulkMessage', 'Invalid Request', "", "Rahul", "", Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
            return Utils.respond(res, {}, Constants.INVALID_REQUEST, Constants.RESPONSE_FAILURE);
        }
        var msgResponse="";
        for (let index = 0; index < bulkMsgRequest.phone.length; index++) {
            let notification = {
                type: bulkMsgRequest.type,
                postedTo: bulkMsgRequest.phone[index],
                description: bulkMsgRequest.message
            };
            msgResponse = yield QueueBLManager.sendNotification(notification).catch(function (err) {
                return Utils.respond(res, err, Constants.WEBSERVICE_ERROR_RESPONSE, Constants.RESPONSE_FAILURE);
            });
        }
        if(!msgResponse) {
            Utils.LHTLog('sendBulkMessage', Constants.MESSAGE_SENT_FAILURE, "", "Rahul", "", Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
            return Utils.respond(res, {}, Constants.MESSAGE_SENT_FAILURE, Constants.RESPONSE_FAILURE);
        }
        return Utils.respond(res, msgResponse, Constants.MESSAGE_SENT_SUCCESSFULLY, Constants.RESPONSE_SUCCESS);
    }),
};