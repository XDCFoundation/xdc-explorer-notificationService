//require generic files

const Utility = require('../../app/utils');
const Constants = require('../../app/common/constants');


module.exports = {
    validateGetNotificationListRequest: function (req, res, next) {
        Utility.LHTLog('validateGetNotificationListRequest', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: req.body
        }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
        var schema = {
            userID: {
                notEmpty: true,
                errorMessage: 'userID is required and can not be null'
            },
            notificationFor: {
                notEmpty: true,
                errorMessage: 'notificationFor is required and can not be null'
            }
        };

        req.checkParams(schema);

        var errors = req.validationErrors();
        if (!errors) {
            Utility.LHTLog('validateGetNotificationListRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: {}
            }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return next();
        } else {
            Utility.LHTLog('validateGetNotificationListRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: errors
            }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return Utility.respondWithArray(res, [], errors, Constants.RESPONSE_FAILURE);
        }
    },

    validateMarkNotificationReadRequest: function (req, res, next) {
        Utility.LHTLog('validateMarkNotificationReadRequest', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: req.body
        }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

        var schema = {
            _id: {
                notEmpty: true,
                errorMessage: 'notification id(_id) is required and can not be null'
            }
        };

        req.checkBody(schema);

        var errors = req.validationErrors();
        if (!errors) {
            Utility.LHTLog('validateMarkNotificationReadRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: {}
            }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return next();
        } else {
            Utility.LHTLog('validateMarkNotificationReadRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: errors
            }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return Utility.respondWithArray(res, {}, errors, Constants.RESPONSE_FAILURE);
        }
    },

    validateMarkNotificationUnreadRequest: function (req, res, next) {
        Utility.LHTLog('validateMarkNotificationUnreadRequest', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: req.body
        }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

        var schema = {
            _id: {
                notEmpty: true,
                errorMessage: 'notification id(_id) is required and can not be null'
            }
        };

        req.checkBody(schema);

        var errors = req.validationErrors();
        if (!errors) {
            Utility.LHTLog('validateMarkNotificationUnreadRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: {}
            }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return next();
        } else {
            Utility.LHTLog('validateMarkNotificationUnreadRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: errors
            }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return Utility.respondWithArray(res, {}, errors, Constants.RESPONSE_FAILURE);
        }
    },

    validateMarkAllNotificationReadRequest: function (req, res, next) {
        Utility.LHTLog('validateMarkAllNotificationReadRequest', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: req.body
        }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

        var schema = {
            userID: {
                notEmpty: true,
                errorMessage: 'userID is required and can not be null'
            },
            notificationFor: {
                notEmpty: true,
                errorMessage: 'notificationFor is required and can not be null'
            }
        };

        req.checkBody(schema);

        var errors = req.validationErrors();
        if (!errors) {
            Utility.LHTLog('validateMarkAllNotificationReadRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: {}
            }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return next();
        } else {
            Utility.LHTLog('validateMarkAllNotificationReadRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: errors
            }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return Utility.respondWithArray(res, {}, errors, Constants.RESPONSE_FAILURE);
        }
    },
    validationMarkNotificationReadByQueryObject: function (req, res, next) {
        Utility.LHTLog('validationGetNotificationListByQueryObjRequest', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: req.body
        }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

        let schema = {
            queryObj: {
                notEmpty: true,
                errorMessage: 'queryObj is required and can not be null'
            }
        };

        req.checkBody(schema);

        let errors = req.validationErrors();
        if (!errors) {
            Utility.LHTLog('validationGetNotificationListByQueryObjRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: {}
            }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return next();
        } else {
            Utility.LHTLog('validationGetNotificationListByQueryObjRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: errors
            }, "Manish", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return Utility.respondWithArray(res, {}, errors, Constants.RESPONSE_FAILURE);
        }
    },
    validationGetNotificationListByQueryObj: function (req, res, next) {
        Utility.LHTLog('validationGetNotificationListByQueryObjRequest', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: req.body
        }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

        let schema = {
            queryObj: {
                notEmpty: true,
                errorMessage: 'queryObj is required and can not be null'
            },
            selectionString:{
                notEmpty: true,
                errorMessage: 'selectionString is required and can not be null'
            }
        };

        req.checkBody(schema);

        let errors = req.validationErrors();
        if (!errors) {
            Utility.LHTLog('validationGetNotificationListByQueryObjRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: {}
            }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return next();
        } else {
            Utility.LHTLog('validationGetNotificationListByQueryObjRequest', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: errors
            }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return Utility.respondWithArray(res, {}, errors, Constants.RESPONSE_FAILURE);
        }
    },
    validationMarkBulkNotificationRead: function (req, res, next) {
        Utility.LHTLog('validationMarkBulkNotificationRead', 'start', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: req.body
        }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);

        let schema = {
            notificationIDArray: {
                notEmpty: true,
                notificationIDArray: 'notificationIDArray is required and can not be null'
            }
        };

        req.checkBody(schema);

        let errors = req.validationErrors();
        if (!errors) {
            Utility.LHTLog('validationMarkBulkNotificationRead', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: {}
            }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return next();
        } else {
            Utility.LHTLog('validationMarkBulkNotificationRead', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: errors
            }, "Vrinda", req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY], Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            return Utility.respondWithArray(res, {}, errors, Constants.RESPONSE_FAILURE);
        }
    }
};