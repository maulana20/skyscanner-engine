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
const skyscanner_engine_airport = express.Router()

// CONFIG ROUTE
skyscanner_engine_airport.get("/search", function (req, res) {
    var keyword = req.query.keyword
    if (!keyword || keyword.length < 3) {
        res.json({
            status: "FAILED",
            message: "Failed get search result",
            content: null,
            reason: "INCOMPLETE_PARAM"
        })
        return
    }

    __searchAirport(keyword).then(function (result) {
        var data = JSON.parse(result).Places
        var result_data = []
        data.forEach(function (item) {
            if (item.PlaceId.length > 7) {
                return
            }
            result_data.push({
                code: item.PlaceId.split("-sky").join(""),
                name: item.PlaceName,
                type: "Airport",
                country: item.CountryName
            })
        });
        res.json({
            status: "SUCCESS",
            message: "Search result retrieved successfully",
            content: result_data,
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

// FUNCTIONS
function __searchAirport(keyword) {
    return new Promise(function (resolve, reject) {
        request.get(
            "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/ID/IDR/id-ID/" + "?" + qs.stringify({query: keyword}), 
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

module.exports = skyscanner_engine_airport