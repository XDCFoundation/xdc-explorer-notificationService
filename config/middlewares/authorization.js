/*
 *  Generic require login routing middleware
 */

const Constants = require('../../app/common/constants');
const HttpService = require('../../app/service/http-service');
const Utils = require('../../app/utils');
const Config = require('../../config');
/***
 *
 * @type {Function}
 */

exports.validateSession = async function (req, res, next) {
    try {
        if(Config.SKIP_SESSION_VALIDATION=='true')
            return next();
        if (!req.headers[Constants.HEADER_KEYS.DEVICE_ID] || !req.headers[Constants.HEADER_KEYS.SESSION_TOKEN]) {
            return Utils.respond(res, {}, Constants.API_MESSAGE.FAILURE.DEVICE_ID_OR_SESSION_TOKEN_EMPTY, Constants.RESPONSE_FAILURE, Constants.RESPONSE_CODE.BAD_REQUEST);
        }
        let headers={
            'device-id':req.headers[Constants.HEADER_KEYS.DEVICE_ID],
            'session-token':req.headers[Constants.HEADER_KEYS.SESSION_TOKEN],
        };
        const validateSessionResponse = await HttpService.executeHttpRequestWithRQ(Constants.HTTP_METHOD.GET, Config.USER_SERVICE_BASE_URL, Constants.PATHS.VALIDATE_SESSION, {},headers);

        if (validateSessionResponse && validateSessionResponse.success) {
            return next();
        }
        else {
            return Utils.respond(res, null, validateSessionResponse.message[0].msg, Constants.RESPONSE_FAILURE, validateSessionResponse.message[0].errorCode);
        }
    }
    catch (err) {
        console.log(err);
    }
};