var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/**
 * Notification schema
 */
var NotificationSchema = new Schema({
    title: {type: String, default: ''},
    payload: {type: Schema.Types.Mixed, default: ''},
    description: {type: String, default: ''},
    postedBy: {type: String, default: ''},
    postedTo: {type: String, default: ''},
    postedToDeviceType: {type: String, default: ''},
    isDelivered: {type: Boolean, default: false},
    type: {type: String, default: ''},
    notificationFor: {type: String, default: ''},
    entityID: {type: String, default: ''},
    priority: {type: Number, default: 1},
    sentFromEmail: {type: String, default: ''},
    sentFromName: {type: String, default: ''},
    userID: {type: String, default: ''},
    deviceID: {type: String, default: ''},
    isRead: {type: Boolean, default: false},
    isCleared: {type: Boolean, default: false},
    messageProvider: {type: String, default: ''},
    addedOn: {type: Number, default: (new Date).getTime()},
    modifiedOn: {type: Number, default: (new Date).getTime()}
});

/**
 * Methods
 */

NotificationSchema.method({
    saveNotification: function () {
        return this.save();
    },

});

/**
 * Statics
 */
NotificationSchema.static({
    getPendingNotification: function () {
        return this.find({isDelivered: false}).sort('addedOn').limit(5).exec();
    },
    deleteNotification: function (notificationObject) {
        return this.find({_id: notificationObject._id}).remove().exec();
    },
    saveNotificationList: function (notificationList) {
        return this.create(notificationList);
    },
    findAllByObject: function (object) {
        return this.find(object).exec();
    },
    findByQueryObj: function (object, selectKey, sortKey) {

        return this.find(object).sort(sortKey).select(selectKey).exec();
    },
    updateAllByObject: function (findObject, updateObject) {
        return this.update(findObject, updateObject, {multi: true, new: true}).exec();
    },
    getNotificationUnreadCount: function (queryObj) {
        queryObj.isRead = false;
        return this.find(queryObj).count();
    },
});

/**
 * Register
 */
mongoose.model('NS-Notification', NotificationSchema);