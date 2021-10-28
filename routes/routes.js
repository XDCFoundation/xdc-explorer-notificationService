const notificationController = require('../app/controllers/notification');
const messageController = require('../app/controllers/messages');
const ValidationManager = require('../config/middlewares/validation-config');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../config/swagger.json');
const requestIDManager = require('../config/middlewares/request_id_manager');
const cors = require('cors');
const authorization = require('../config/middlewares/authorization');

module.exports = function (app) {
    app.use(cors());
    /** check server running **/
    app.get('/', function (req, res) {
        res.send("Notification service is working fine");
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, true));
    /**
     * check for requestID and generate new if not came in request header
     * @param req
     * @param res
     * @param next
     */
    let checkForRequestID = function (req, res, next) {
        requestIDManager.checkRequestID(req, res, next);
    }

    app.use(checkForRequestID);//check requestID
    //user APIs
     app.use(authorization.validateSession);
    app.post('/add-to-notifications', notificationController.addToNotifications);

    app.post('/add-notification-list', notificationController.addNotificationList);

    app.get('/notifications/:userID/:notificationFor/:entityID', ValidationManager.validateGetNotificationListRequest, notificationController.getNotificationList);

    app.post('/mark-notification-read', ValidationManager.validateMarkNotificationReadRequest, notificationController.markNotificationRead);

    app.post('/mark-notification-unread', ValidationManager.validateMarkNotificationUnreadRequest, notificationController.markNotificationUnread);

    app.post('/mark-all-notification-read', ValidationManager.validateMarkAllNotificationReadRequest, notificationController.markAllNotificationRead);

    app.post('/send-bulk-sms', messageController.sendBulkMessage);

    app.post('/notification-list', ValidationManager.validationGetNotificationListByQueryObj, notificationController.getNotificationListByQueryObj)

    app.post('/notification-count', notificationController.getNotificationUnreadCount);

    app.post('/mark-bulk-notification-read', notificationController.markBulkNotificationRead);

    app.post('/mark-bulk-notification-clear', notificationController.markBulkNotificationCleared);

    app.post('/mark-notification-read-queryObj',ValidationManager.validationMarkNotificationReadByQueryObject, notificationController.markAllNotificationReadByQuery);


};