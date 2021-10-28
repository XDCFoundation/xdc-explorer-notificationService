/**
 * Created by Sameer on 30/09/16.
 */
module.exports = {

    SERVICE_NAME: 'LHT_Notification_Service',
    SMS_SERVICE_PROVIDER: {
        PLIVO: 'plivo',
        MSG91: 'MSG91',
        TWILIO: 'twilio',
        SNS:'sns'
    },

    PUSH_NOTIFICATION_PROVIDER: {
        SNS: 'SNS',
        FCM: 'FCM'
    },
    //Elastic Email Constants change for the project
    //ELASTIC_EMAIL_API_KEY:"ELASTIC_KEY",
    //ELASTIC_EMAIL_USERNAME:"EMAIL",

    // ELASTIC_EMAIL_API_KEY: "ELASTIC_KEY",
    // ELASTIC_EMAIL_USERNAME: "EMAIL",
    // //AWS Constants
    // AWS_ACCESS_KEY: 'ACCESS_KEY',
    // AWS_SECRET_KEY: 'SECRET_KEY',
    // AWS_SNS_REGION: 'REGION',


    //Device Type Constants
    DEVICE_TYPE_IOS: 'ios',
    DEVICE_TYPE_ANDROID: 'android',

    //API Messages
    API_DATA_SUCCESSFULLY_FETCHED: 'Data successfully fetched',

    //General Constants
    RESPONSE_SUCCESS: true,
    RESPONSE_FAILURE: false,

    //Message constants
    NOTIFICATION_SAVED_SUCCESSFULLY: 'Notification saved successfully.',
    NOTIFICATION_COUNT_FETCHED_SUCCESSFULLY: 'Notification count fetched successfully.',
    NOTIFICATION_FETCHED_SUCCESSFULLY: 'Notification list fetched successfully.',
    FAILED_TO_FETCHED_NOTIFICATION_COUNT: 'Failed to fetch notification count.',
    FAILED_TO_FETCHED_NOTIFICATION_LIST: 'Failed to fetch notification list.',
    NOTIFICATION_MARKED_READ_SUCCESSFULLY: 'Notification marked read successfully.',
    NOTIFICATION_MARKED_READ_FAILED: 'Failed to mark notification read.',
    NOTIFICATION_MARKED_UNREAD_SUCCESSFULLY: 'Notification marked unread successfully.',
    NOTIFICATION_MARKED_UNREAD_FAILED: 'Failed to mark notification unread.',
    NOTIFICATION_MARKED_CLEAR_SUCCESSFULLY: 'Notification marked cleared successfully.',
    NOTIFICATION_MARKED_CLEAR_FAILED: 'Failed to mark notification clear.',
    WEBSERVICE_ERROR_RESPONSE: 'Some error occurred while handling your request.Please try again later!',
    PARAMETER_MISSING: 'Parameter missing',
    INVALID_REQUEST: 'Invalid Request',
    MESSAGE_SENT_SUCCESSFULLY: 'Message Sent Successfully',
    MESSAGE_SENT_FAILURE: 'Message Sent Failure',

    //Notification Type Constants
    NOTIFICATION_TYPE_PUSH: 'push',
    NOTIFICATION_TYPE_EMAIL: 'email',
    NOTIFICATION_TYPE_SMS: 'sms',
    NOTIFICATION_TYPE_SLACK: 'slack',


    //queue constants
    ONE_TO_ONE_QUEUE: 'one_to_one_queue',
    DISTRIBUTED_QUEUE: 'distributed_queue',
    PUBLISHER_SUBSCRIBER_QUEUE: 'publisher_subscriber_queue',
    ROUTING_QUEUE: 'routing_queue',
    TOPICS_QUEUE: 'topics_queue',
    REQUEST_REPLY_QUEUE: 'request_reply_queue',
    EXCHANGE_TYPE_FANOUT: 'fanout',
    EXCHANGE_TYPE_TOPIC: 'topic',
    EXCHANGE_TYPE_DIRECT: 'direct',
    CURRENT_TIMESTAMP: (new Date()).getTime(),

    LOG_OPERATION_TYPE: {
        DB_OPERATION: 'DB_OPERATION',
        DB_CONNECTION: 'DB_CONNECTION',
        FUNCTIONAL: 'FUNCTIONAL',
        HTTP_REQUEST: 'HTTP_REQUEST',
        RABBIT_MQ_OPERATION: 'RABBIT_MQ_OPERATION',
        CRON_OPERATION: 'CRON_OPERATION'
    },
    HEADER_KEY_REQUEST_ID_KEY: 'request-id',
    LOG_LEVEL_TYPE: {
        INFO: 'info',
        ERROR: 'error',
        WARN: 'warn',
        VERBOSE: 'verbose',
        DEBUG: 'debug',
        SILLY: 'silly'
    },
    METHOD_TYPE: {
        POST: 'POST',
        GET: 'GET',
        PUT: 'PUT'
    },
    PATHS: {
        GET_ALL_LOGIN_DEVICE: 'get-all-login-device',
        VALIDATE_SESSION: "validate-session"
    },
    HTTP: {
        HEADER_TYPE: {
            URL_ENCODED: 'content-type": "application/x-www-form-urlencoded',
            APPLICATION_JSON: 'content-type": "application/json',
        }
    },
    HEADER_KEYS: {
        DEVICE_TYPE: 'device-type',
        DEVICE_ID: 'device-id',
        SESSION_TOKEN: 'session-token'
    },
    DEVICE_TYPE: {
        ANDROID: 'android',
        IOS: 'ios',
        WEB: 'web'
    },
    HTTP_METHOD: {
        GET: 'GET',
        POST: 'POST'
    },
    API_MESSAGE: {
        FAILURE: {
            DEVICE_ID_OR_SESSION_TOKEN_EMPTY: "Device id or session token can't be empty or null.",
        }
    },
    RESPONSE_CODE: {
        UNAUTHORISED: 401,
        INTERNAL_SERVER_ERROR: 500,
        NOT_FOUND: 404,
        SUCCESS: 200,
        NO_CONTENT_FOUND: 204,
        BAD_REQUEST: 400,
        FORBIDDEN: 403,
        GONE: 410,
        UNSUPPORTED_MEDIA_TYPE: 415,
        TOO_MANY_REQUEST: 429
    }
};