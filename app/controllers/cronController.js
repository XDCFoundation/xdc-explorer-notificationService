/**
 * Created by Developer on 10/10/16.
 */
var CronJob = require('cron').CronJob;
const mongoose = require('mongoose');

var CronBLManager = require("../managers/cron_bl_manager.js");

const Notification = mongoose.model('NS-Notification');
const NotificationLog = mongoose.model('NS-NotificationLog');
const co = require('co');
const Constants = require('../common/constants');
const Utils = require('../utils');


var notificationJob = new CronJob("*/10 * * * * *", co.wrap(function*() {


    console.log("Cron For Notifications running");
    var pendingNotificationList = yield Notification.getPendingNotification();
    //console.log("Pending Notifications"+pendingNotificationList);
    for (var notificationIndex = 0; notificationIndex < pendingNotificationList.length; notificationIndex++) {
        //if((pendingNotificationList[notificationIndex].postedTo!=null)||(pendingNotificationList[notificationIndex].postedTo!=""))
        //    console.log("true");
        //var sendNotifications = yield CronBLManager.sendNotification(pendingNotificationList[notificationIndex]);


    }


}), function () {
    console.log("This is executed when cron stops");
}, true);

