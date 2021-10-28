/**
 * Created by Sanjeet on 14/12/16.
 */
const Utils = require('../utils');
const Constants = require('../common/constants');
const Config = require('../../config');
var https = require('https');
var http = require('../service/http-service');
var querystring = require('querystring');
const AWS = require('aws-sdk');
module.exports = {
    sendEmail
};


/*
function sendEmail(to, subject, body_text, body_html, from, fromName,requestID='0') {
    // Make sure to add your username and api_key below.
    Utils.LHTLog('sendEmail','start',{type:Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,data:{to:to, subject:subject,body_text: body_text,body_html: body_html,from:from,fromName: fromName}},"Manish",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);

    return new Promise(function (resolve, reject) {
        var post_data = querystring.stringify({
            'username': Config.ELASTIC_EMAIL_USERNAME,
            'api_key': Config.ELASTIC_EMAIL_API_KEY,
            'from': from,
            'from_name': fromName,
            'to': to,
            'subject': subject,
            'body_html': body_html,
            'body_text': body_text
        });

        // Object of options.
        var post_options = {
            host: 'api.elasticemail.com',
            path: '/mailer/send',
            port: '443',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }
        };

        var result = true;

        // Create the request object.
        var post_req = https.request(post_options, function (res) {

            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log("sent");
                Utils.LHTLog('sendEmail','end',{type:Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,data:{data:true}},"Manish",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
                result = true;
                resolve(result);
            });
            res.on('error', function (err) {
                console.log("error");
                Utils.LHTLog('sendEmail','end',{type:Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,data:{error:err}},"Manish",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
                result = false;
                resolve(result);
            });
        });

        // Post to Elastic Email
        post_req.write(post_data);
        post_req.end();
        Utils.LHTLog('sendEmail','end',{type:Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,data:{to:to, subject:subject,body_text: body_text,body_html: body_html,from:from,fromName: fromName}},"Manish",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);

    });

}*/
async function sendEmail(to, subject, body_text, body_html, from, fromName, requestID = '0') {
    // Make sure to add your username and api_key below.
    Utils.LHTLog('sendEmail', 'start', {
        type: Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,
        data: {to: to, subject: subject, body_text: body_text, body_html: body_html, from: from, fromName: fromName}
    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
    if (Config.IS_TO_SEND_EMAIL_USING_MAILGUN && Config.IS_TO_SEND_EMAIL_USING_MAILGUN === 'true') {

        return await sendEmailUsingMailgun(to, subject, body_text, body_html, from, fromName, requestID = '0')

    } else if (Config.IS_TO_SEND_EMAIL_USING_SEND_GRID && Config.IS_TO_SEND_EMAIL_USING_SEND_GRID === 'true') {

        return await sendEmailUsingSendGrid(to, subject, body_text, body_html, from, fromName, requestID = '0')

    } else if (Config.IS_TO_SEND_EMAIL_USING_SEND_SES && Config.IS_TO_SEND_EMAIL_USING_SEND_SES === 'true') {
        return await sendEmailUsingSendSES(to, subject, body_text, body_html, from, fromName, requestID = '0')

    }

    var post_data = querystring.stringify({
        'username': Config.ELASTIC_EMAIL_USERNAME,
        'api_key': Config.ELASTIC_EMAIL_API_KEY,
        'from': from,
        'from_name': fromName,
        'to': to,
        'subject': subject,
        'body_html': body_html,
        'body_text': body_text
    });

    // Object of options.
    var post_options = {
        host: 'http://api.elasticemail.com',
        path: '/mailer/send',
        port: '443',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        }
    };
    Utils.LHTLog('sendEmail', 'end', {
        type: Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,
        data: {to: to, subject: subject, body_text: body_text, body_html: body_html, from: from, fromName: fromName}
    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
    var post_res = await http.executeHttpRequestWithRQ(post_options.method, post_options.host, post_options.path, post_data, post_options.headers)

    Utils.LHTLog('post_res', 'end', {
        type: Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,
        data: {post_res: post_res}
    }, "Manish", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
    return post_res;

}

async function sendEmailUsingMailgun(to, subject, body_text, body_html, from, fromName, requestID = '0') {
    console.log("here i am 3")
    var api_key = Config.MAIL_GUN_API_KEY; //'ebf9c130c93e78fe7fa4da73a5d46ad1-9949a98f-ed80d7b5';
    var domain = Config.MAIL_GUN_DOMAIN; //'sandbox7c41722782df49d7adb43b5db683ebb7.mailgun.org';
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

    var data = {
        from: fromName + '<' + from + '>',
        to: to,
        subject: subject,
        text: body_text,
        html: body_html
    };

    Utils.LHTLog('sendEmailMailGun', 'end', {
        type: Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,
        data: {to: to, subject: subject, body_text: body_text, body_html: body_html, from: from, fromName: fromName}
    }, "Anurag", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

    let sendMailRes = await mailgun.messages().send(data).catch(err => {
        Utils.LHTLog('error_mailgun', 'end', {
            type: Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,
            data: {post_res: err}
        }, "Anurag", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        return error
    })

    Utils.LHTLog('post_res_mailgun', 'end', {
        type: Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,
        data: {post_res: sendMailRes}
    }, "Anurag", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

    return sendMailRes;
}

async function sendEmailUsingSendGrid(to, subject, body_text, body_html, from, fromName, requestID = '0') {

    const sendGridMail = require('@sendgrid/mail');
    sendGridMail.setApiKey(Config.SEND_GRID_API_KEY);

    Utils.LHTLog('sendEmailUsingSendGrid', 'end', {
        type: Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,
        data: {to: to, subject: subject, body_text: body_text, body_html: body_html, from: from, fromName: fromName}
    }, "AyushK", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

    const postData = {
        to: to,
        from: fromName + '<' + from + '>',
        subject: subject,
        text: body_text ? body_text : "-",
        html: body_html,
    };
    let mailResponse = await sendGridMail.send(postData).catch(err => {
        Utils.LHTLog('error_sendGridMail', 'end', {
            type: Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,
            data: {post_res: err}
        }, "AyushK", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);
        return err
    });

    Utils.LHTLog('post_res_sendGridMail', 'end', {
        type: Constants.LOG_OPERATION_TYPE.HTTP_REQUEST,
        data: {post_res: mailResponse}
    }, "AyushK", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

    return mailResponse;
}

async function sendEmailUsingSendSES(to, subject, body_text, body_html, from, fromName, requestID = '0') {
    const SES_CONFIG = {
        accessKeyId: Config.AWS_ACCESS_KEY,
        secretAccessKey: Config.AWS_SECRET_KEY,
        region: Config.AWS_SES_REGION
    };
    AWS.config.update(SES_CONFIG);
    let params = {
        Source: fromName + '<' + from + '>',
        // Template: '<name of your template>',
        Destination: {
            ToAddresses: [
                // recipientEmail
                to
            ]
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: body_html
                },
                Text: {
                    Charset: "UTF-8",
                    Data: body_text
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        }
    };
    try {
        let mailResponse = await new AWS.SES().sendEmail(params).promise()
        console.log("mailResponse====", mailResponse)
        return mailResponse
    } catch (e) {
        console.log("mailError=", e)

    }


}
