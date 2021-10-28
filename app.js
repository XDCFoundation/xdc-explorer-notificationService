'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const EXPRESS_VALIDATOR = require('express-validator');
const fs = require('fs');
//var swagger = require('swagger-jsdoc');
var users = require('./routes/users');
const join = require('path').join;
var mongoose = require('mongoose');
var app = express();
const models = join(__dirname, 'app/models');
const compression = require('compression')
const uuid = require('uuid');
let requestID = uuid.v1();
const utils = require('./app/utils/index');
const constants = require('./app/common/constants');

var Co = require('co');
const DBConnect = require('./config/dbConnect.js');
const Config = require('./config');
const HTTPS = require("https");
var amqpConnection;


var port = normalizePort(process.env.PORT || '3006');

fs.readdirSync(models)
    .filter(file => ~file.indexOf('.js'))
    .forEach(file => require(join(models, file)));

//TODO uncomment if cron is to be used.
// const Cron = require('./app/controllers/cronController.js');
// const CronBLManager = require('./app/managers/cron_bl_manager.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compression(9));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(EXPRESS_VALIDATOR());
app.use(cookieParser());


/**
 * * Swagger configuration
 */



require('./routes/routes')(app);
//app.use('/', routes);
app.use('/users', users);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    utils.LHTLog('normalizePort', 'start', {
        type: constants.LOG_OPERATION_TYPE.DB_CONNECTION,
        data: val
    }, "Manish", requestID, constants.LOG_LEVEL_TYPE.INFO, constants.CURRENT_TIMESTAMP);

    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        utils.LHTLog('normalizePort', 'end', {
            type: constants.LOG_OPERATION_TYPE.DB_CONNECTION,
            data: {returnValue: val, port: port}
        }, "Manish", requestID, constants.LOG_LEVEL_TYPE.INFO, constants.CURRENT_TIMESTAMP);
        return val;
    }

    if (port >= 0) {
        // port number
        utils.LHTLog('normalizePort', 'end', {
            type: constants.LOG_OPERATION_TYPE.DB_CONNECTION,
            data: {returnValue: port, port: port}
        }, "Manish", requestID, constants.LOG_LEVEL_TYPE.INFO, constants.CURRENT_TIMESTAMP);
        return port;
    }
    utils.LHTLog('normalizePort', 'end', {
        type: constants.LOG_OPERATION_TYPE.DB_CONNECTION,
        data: {returnValue: false}
    }, "Manish", requestID, constants.LOG_LEVEL_TYPE.INFO, constants.CURRENT_TIMESTAMP);
    return false;
}

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    next();
};
/*
var key = fs.readFileSync(path.join(__dirname, '/cert/private.txt'));
var cert = fs.readFileSync(path.join(__dirname, '/cert/STAR_leewayhertz_biz.crt'));
var ca = fs.readFileSync(path.join(__dirname, '/cert/COMODORSADomainValidationSecureServerCA.crt'));*/
// var ca = fs.readFileSync(path.join(__dirname, '/cert/COMODORSAAddTrustCA.crt'));
/*var certOptions = {
    key: key,
    cert: cert,
    ca: ca
};*/
var certOptions = {
    key: fs.readFileSync(path.join(__dirname, '/cert/private.txt')),
    cert: fs.readFileSync(path.join(__dirname, '/cert/STAR_leewayhertz_biz.crt')),
    ca: fs.readFileSync(path.join(__dirname, '/cert/COMODORSADomainValidationSecureServerCA.crt'))
};

var connection = connect();
connection
    .on('error', function dbConnectErrorCallback(err) {
        utils.LHTLog('dbConnectErrorCallback', 'failed to connect', {
            type: constants.LOG_OPERATION_TYPE.DB_CONNECTION,
            data: err
        }, "Manish", requestID, constants.LOG_LEVEL_TYPE.ERROR, constants.CURRENT_TIMESTAMP);
    })
    .on('disconnected', function () {
        utils.LHTLog('OnDisconnect', 'disconnected', {
            type: constants.LOG_OPERATION_TYPE.DB_CONNECTION,
            data: {}
        }, "Manish", requestID, constants.LOG_LEVEL_TYPE.INFO, constants.CURRENT_TIMESTAMP);
    })
    .once('open', listen);

function connect() {
    utils.LHTLog('connect', 'DB trying to connect', {
        type: constants.LOG_OPERATION_TYPE.DB_CONNECTION,
        data: {db: Config.db}
    }, "Manish", requestID, constants.LOG_LEVEL_TYPE.INFO, constants.CURRENT_TIMESTAMP);
    var options = {server: {socketOptions: {keepAlive: 1}}};
    return mongoose.connect(process.env.DB || Config.DB, options).connection;
    //return mongoose.connect("MONGO_URL", options).connection;
}


function listen() {
    if (Config.IS_HTTPS === 'true')
        HTTPS.createServer(certOptions, app).listen(port);
    else
        app.listen(port);
    utils.LHTLog('listen', 'APP started', {
        type: constants.LOG_OPERATION_TYPE.DB_CONNECTION,
        data: {port: port}
    }, "Manish", requestID, constants.LOG_LEVEL_TYPE.INFO, constants.CURRENT_TIMESTAMP);
    console.log('Express app started on port ' + port + " " + app.get('env') + " " + (new Date()));
    conn();
}

var conn = Co.wrap(function* () {
    utils.LHTLog('conn', 'start', {
        type: constants.LOG_OPERATION_TYPE.DB_CONNECTION,
        data: {}
    }, "Manish", requestID, constants.LOG_LEVEL_TYPE.INFO, constants.CURRENT_TIMESTAMP);
    const conn = yield require('./LHTRabbitMqClientLibrary/index').conn(Config.AMQP_HOST_URL);
    if (conn)
        require('./app/controllers/queue').notification(requestID);
    utils.LHTLog('conn', 'end', {
        type: constants.LOG_OPERATION_TYPE.DB_CONNECTION,
        data: {}
    }, "Manish", requestID, constants.LOG_LEVEL_TYPE.INFO, constants.CURRENT_TIMESTAMP);

});

app.use(allowCrossDomain);
module.exports = {app, connection, amqpConnection};

//var sendNotificationResponse = CronBLManager.sendNotification();
