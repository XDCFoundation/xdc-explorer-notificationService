var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/**
 * Notification Logs schema
 */
var NotificationLogsSchema = new Schema({
    notificationID: {type: String, default: ''},
    title: {type: String, default: ''},
    payload: {type: Schema.Types.Mixed, default: ''},
    description: {type: String, default: ''},
    postedBy: {type: String, default: ''},
    postedTo: {type: String, default: ''},
    postedToDeviceType: {type: String, default: ''},
    isDelivered: {type: Boolean, default: true},
    type: {type: String, default: ''},
    priority: {type: Number, default: ''},
    addedOn: {type: Number, default: (new Date).getTime()},
    modifiedOn: {type: Number, default: (new Date).getTime()},
    sentFromEmail: {type: String, default: ''},
    sentFromName: {type: String, default: ''},
    notificationResponse: {type: Schema.Types.Mixed, default: ''}
});

NotificationLogsSchema.method({
    saveToNotificationLog: function () {
        return this.save();
    },

});

/**
 * Register
 */
mongoose.model('NS-NotificationLog', NotificationLogsSchema);