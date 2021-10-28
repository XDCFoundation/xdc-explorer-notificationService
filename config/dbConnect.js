/**
 * Created by jayeshc on 12/29/16.
 */
"use strict"
const CONFIG = require('./');
let mongoose = require('mongoose');
module.exports = {connection: connect};

function connect() {
    console.log("DB trying to connect on " + new Date());
    var options = {server: {socketOptions: {keepAlive: 1}}};
    return mongoose.connect(CONFIG.DB, options).connection;
}
