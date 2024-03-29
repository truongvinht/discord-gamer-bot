// apiAccessService.js
// Service to access custom API using Restful Services.
// ==================

// import
const https = require('https');
const http = require('http');

/**
 * Service to acccess Restful API for Yuanshen.
 */
class ApiAccessService {
    /**
     * Constructor for initializing api url and token
     * @constructor
     * @param {string} url - API Server URL
     * @param {string} token - Access Token
     */
    constructor (url, token, port, ssl) {
        // invalid url
        if (url === undefined || url == null) {
            throw new TypeError("Invalid input for 'url'");
        }

        // invalid token
        if (token === undefined || token == null) {
            throw new TypeError("Invalid input for 'token'");
        }
        this.url = url;
        this.token = token;
        this.port = port;

        if (ssl) {
            this.httpRequest = https;
        } else {
            this.httpRequest = http;
        }
    }

    /**
     * Trigger a GET Request
     * @param {requestCallback} callback callback to handle result and error
     * @param {string} path api path for GET request
     * @param {Object} param key value map as parameter for request
     */
    getRequest (callback, path, param) {
        let header = {};

        // include parameter to header
        if (param == null) {
            header = { authorization: this.token };
        } else {
            header = param;
            header.authorization = this.token;
        }

        // prepare GET request
        const options = {
            host: this.url,
            port: this.port,
            path: path,
            method: 'GET',
            headers: header
        };

        // fire request
        this.httpRequest.get(options, res => {
            // collect data for callback
            const data = [];

            const status = res.statusCode;

            res.on('data', chunk => {
                data.push(chunk);
            });

            res.on('end', () => {
                const content = Buffer.concat(data).toString();
                const responseData = JSON.parse(content);

                if (status !== 200) {
                    // return result to callback
                    console.log(status);
                    console.log(this.url);
                    callback(null, `Bad Request [${status}]`);
                } else {
                    callback(responseData, null);
                }
            });
        }).on('error', err => {
            console.log('Error: ', err.message);

            // return error to callback
            callback(null, err);
        });
    }

};
module.exports = ApiAccessService;
