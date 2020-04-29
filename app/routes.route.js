const express = require('express')
const request = require("request");
const qs = require('querystring')
const lib = require("./__lib")
const application_env = process.argv[2]
const config = require('../__config')[application_env || 'development']
if (!config) {
    const config = require('../__config')['development']
}

const skyscanner_routes = express.Router()

// CONFIG ROUTE REQUEST
skyscanner_routes.post("/routes", function (req, res) {
    var params = {
        country: 'ID',
        currency: 'IDR',
        locale: 'id-ID',
        originPlace: req.body['origin'] + "-sky",
        destinationPlace: req.body['destination'] + "-sky",
        outboundPartialDate: req.body['depart_date'],
    }

    var skyscanner_requests = [
        __searchRequest(JSON.parse(JSON.stringify(params)))
    ]

    if (req.body["return_date"]) {
        params.outboundDate = req.body["return_date"]
        var tmp = params.originPlace
        params.originPlace = params.destinationPlace
        params.destinationPlace = tmp
        skyscanner_requests.push(__searchRequest(JSON.parse(JSON.stringify(params))))
    }

    Promise.all(skyscanner_requests).then(function (results) {
        var result = {
            depart_schedule: results,
            return_schedule: null
        }

        res.json({
            status: "SUCCESS",
            message: "Search result retrieved successfully",
            content: result,
            reason: null
        })
    }).catch(function (err_code) {
        console.log(err_code)
        res.json({
            status: "FAILED",
            message: "Failed get search result",
            content: null,
            reason: err_code
        })
    })
})

// FUNCTIONS API REQUEST
const url = "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com"

function __searchRequest(params) {
    return new Promise(function (resolve, reject) {
        request.get(
            url + "/apiservices/browseroutes/v1.0/" + Object.values(params).join('/'), 
            { headers: config.request_headers},
            function (err, response, body) {
                if (err) {
                    console.log(err)
                    reject("SERVER_REQ_ERR")
                    return
                }
                switch (response.statusCode) {
                    case 410:
                        reject("SESSION_CODE_EXP")
                        break;
                    case 200:
                        resolve(JSON.parse(body))
                        break;
                    default:
                        reject("SERVER_ERR")
                }
            }
        )
    })
}

module.exports = skyscanner_routes
