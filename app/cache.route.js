const express = require('express')
const request = require("request");
const qs = require('querystring')
const lib = require("./__lib")
const application_env = process.argv[2]
const config = require('../__config')[application_env || 'development']
if (!config) {
    const config = require('../__config')['development']
}

// INITIATE EXPRESS ROUTER
const skyscanner_engine_cache = express.Router()

// CONFIG ROUTE
skyscanner_engine_cache.get("/price", function (req, res) {
    var origin = req.query.origin
    var destination = req.query.destination
    var date = req.query.date
    if (!origin || !destination || !date) {
        res.json({
            status: "FAILED",
            message: "Failed get search result",
            content: null,
            reason: "INCOMPLETE_PARAM"
        })
        return
    }

    __getCachePrice(origin, destination, date).then(function (result) {
        var data = JSON.parse(result).Quotes
        var result_data = {}
        data.forEach(function (item) {
            result_data[item.OutboundLeg.DepartureDate] = item.MinPrice
        });
        res.json({
            status: "SUCCESS",
            message: "Price retrieved successfully",
            content: result_data,
            reason: null
        })
    }).catch(function (err_code) {
        console.log(err_code)
        res.json({
            status: "FAILED",
            message: "Failed get price",
            content: null,
            reason: err_code
        })
    })

    

})

// FUNCTIONS
function __getCachePrice(origin, destination, date) {
    return new Promise(function (resolve, reject) {
        request.get(
            "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsedates/v1.0/ID/IDR/id-ID/" + origin + "-sky/" + destination + "-sky/" + date, 
            { headers: config.request_headers},
            function (err, response, body) {
                if (err) {
                    console.log(err)
                    reject("SERVER_REQ_ERR")
                    return
                }
                switch (response.statusCode) {
                    case 200:
                        resolve(body)
                        break;
                    default:
                        reject("SERVER_ERR")
                }
            }
        )
    })
}

module.exports = skyscanner_engine_cache