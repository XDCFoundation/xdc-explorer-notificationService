/**
 * Created by jayeshc on 12/19/16.
 */
var MORGAN = require('morgan');
var BODY_PARSER = require('body-parser');
module.exports = function (app) {

    //For print APIs Logs
    app.use(MORGAN(':method :url :response-time'));
    // parse application/x-www-form-urlencoded
    app.use(BODY_PARSER.urlencoded({extended: false}));
    // parse application/json
    app.use(BODY_PARSER.json());
};