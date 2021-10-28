const co = require('co');
const http = require("http");
const request = require("request");
const Constants = require('../common/constants');

module.exports = {
    /**
     * execute Http Request request
     */
    executeHttpRequestWithRQ: co.wrap(function* (method, hostname, path, data, headers, requestID = '') {
        return yield new Promise(function (fulfill, reject) {
            request({
                url: hostname + path,
                method: method,
                headers: headers,
                json: data
            }, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else {
                    fulfill(body);
                }
            });
        });
    })

};