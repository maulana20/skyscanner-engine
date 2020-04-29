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
const skyscanner_engine_search = express.Router()

// CONFIG ROUTE
skyscanner_engine_search.post("/create-session", function (req, res) {
    var skyscanner_request_params = {
        country: 'ID',
        currency: 'IDR',
        locale: 'id-ID',
        originPlace: req.body['origin'] + "-sky",
        destinationPlace: req.body['destination'] + "-sky",
        outboundDate: req.body['depart_date'],
        adults: req.body['adult'],

        children: req.body['child'],
        infant: req.body['infant']
    }

    var skyscanner_requests = [
        __createSessionRequest(JSON.parse(JSON.stringify(skyscanner_request_params)))
    ]

    if (req.body["return_date"]) {
        skyscanner_request_params.outboundDate = req.body["return_date"]
        var tmp = skyscanner_request_params.originPlace
        skyscanner_request_params.originPlace = skyscanner_request_params.destinationPlace
        skyscanner_request_params.destinationPlace = tmp
        skyscanner_requests.push(__createSessionRequest(JSON.parse(JSON.stringify(skyscanner_request_params))))
    }

    Promise.all(skyscanner_requests).then(function (session_codes) {
        res.json({
            "status": "SUCCESS",
            "message": "Search session created",
            "content": {
                "session_code": session_codes.join("~~")
            },
            "reason": null
        })
    }).catch(function (err_code) {
        console.log(err_code)
        res.json({
            status: "FAILED",
            message: "Failed create search session",
            content: null,
            reason: err_code
        })
    })
})

skyscanner_engine_search.get("/result", function (req, res) {
    var session = req.query.session_code
    if (!session) {
        res.json({
            status: "FAILED",
            message: "Failed get search result",
            content: null,
            reason: "INCOMPLETE_PARAM"
        })
        return
    }

    
    var skyscanner_request_params = {
        sortType: req.query.sort_by,
        sortOrder: req.query.sort_order
    }

    var skyscanner_requests = []
    session.split("~~").forEach(function (code) {
        skyscanner_requests.push(__getResultRequest(code, skyscanner_request_params))
    })

    Promise.all(skyscanner_requests).then(function (results) {
        var result = {
            depart_schedule: __generateFlightItinerary(results[0]),
            return_schedule: null
        }
        if (results.length > 1) {
            result.return_schedule = __generateFlightItinerary(results[1])
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

// FUNCTIONS
function __createSessionRequest(params) {
    return new Promise(function (resolve, reject) {
        request.post(
            'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/v1.0', 
            { headers: config.request_headers}
        ).form(params).on("response", function (response) {
            switch(response.statusCode) {
                case 400:
                    reject("INCOMPLETE_PARAM")
                    break;
                case 201:
                    resolve(response.headers.location.split("http://partners.api.skyscanner.net/apiservices/pricing/hk1/v1.0/").join(""))
                    break;
                default:
                    reject("SERVER_ERR")
            }
        }).on("error", function (err) {
            console.log(err)
            reject("SERVER_REQ_ERR")
        })
    })
}

function __getResultRequest(session_code, params) {
    return new Promise(function (resolve, reject) {
        request.get(
            "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/uk2/v1.0/" + session_code + "?" + qs.stringify(params), 
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
                        resolve(body)
                        break;
                    default:
                        reject("SERVER_ERR")
                }
            }
        )
    })
}

function __generateFlightItinerary(raw_data) {
    var result_data = {
        airline_dic: {}
    }

    // require("fs").writeFileSync("result.json", raw_data)

    raw_data = JSON.parse(raw_data)

    // generate dic
    raw_data.legs_dic = {}
    raw_data.Legs.forEach(function (leg) {
        raw_data.legs_dic[leg.Id] = leg
    })

    raw_data.carriers_dic = {}
    raw_data.Carriers.forEach(function (carrier) {
        raw_data.carriers_dic[carrier.Id] = carrier
    })

    raw_data.places_dic = {}
    raw_data.Places.forEach(function (place) {
        raw_data.places_dic[place.Id] = place
    })

    // generate base itinerary key
    var itinerary_base_key = raw_data.places_dic[raw_data.Query.OriginPlace].Code + "~" + 
                            raw_data.places_dic[raw_data.Query.DestinationPlace].Code + "|" +
                            raw_data.Query.Adults + "~" + raw_data.Query.Children + "~" + raw_data.Query.Infants + "|" + 
                            raw_data.Query.OutboundDate

    // fill result_data
    result_data.search_status = raw_data.Status == "UpdatesComplete" ? "COMPLETE" : "SEARCHING"
    result_data.search_progress = raw_data.Agents.filter(function (agent) { return agent.Status == "UpdatesComplete" }).length / raw_data.Agents.length
    result_data.itineraries = []

    raw_data.Itineraries.forEach(function (itinerary) {

        // generate pricing dic
        itinerary.pricing_dic = {}
        itinerary.PricingOptions.forEach(function (pricing) {
            pricing.Agents.forEach(function (agent_id) {
                itinerary.pricing_dic[agent_id] = pricing.Price
            })
        })

        // fill itinerary data
        let itinerary_data = [itinerary_base_key]

        // itinerary price
        let itinerary_price = 0
        for (var i = 0; i < config.trusted_agents.length && !itinerary_data.price; i ++) {
            itinerary_data.price = itinerary.pricing_dic[config.trusted_agents[i]]
        }

        if (!itinerary_price) {
            itinerary_price = itinerary.PricingOptions[0].Price
        }

        itinerary_data.push(itinerary_price)

        // itinerary legs
        if (!raw_data.legs_dic[itinerary.OutboundLegId]) {
            return
        }

        var leg = raw_data.legs_dic[itinerary.OutboundLegId]

        // itinerary operator
        itinerary_data.push(raw_data.carriers_dic[leg.OperatingCarriers[0]].Code)

        if (config.included_carriers.indexOf(raw_data.carriers_dic[leg.OperatingCarriers[0]].Id) < 0) {
            return
        }

        if (!result_data.airline_dic[raw_data.carriers_dic[leg.OperatingCarriers[0]].Code]) {
            result_data.airline_dic[raw_data.carriers_dic[leg.OperatingCarriers[0]].Code] = {
                code: raw_data.carriers_dic[leg.OperatingCarriers[0]].Code,
                name: raw_data.carriers_dic[leg.OperatingCarriers[0]].Name,
                image_url: raw_data.carriers_dic[leg.OperatingCarriers[0]].ImageUrl
            }
        }

        // itinerary segments
        leg.SegmentIds.forEach(function (s_id) {
            var segment = raw_data.Segments[s_id]
            var segment_data = [
                raw_data.carriers_dic[segment.Carrier].Code,
                raw_data.carriers_dic[segment.Carrier].Code + " " + segment.FlightNumber,
                raw_data.places_dic[segment.OriginStation].Code + "~" + raw_data.places_dic[segment.DestinationStation].Code,
                segment.DepartureDateTime + "~" + segment.ArrivalDateTime
            ]
            if (!result_data.airline_dic[raw_data.carriers_dic[segment.Carrier].Code]) {
                result_data.airline_dic[raw_data.carriers_dic[segment.Carrier].Code] = {
                    code: raw_data.carriers_dic[segment.Carrier].Code,
                    name: raw_data.carriers_dic[segment.Carrier].Name,
                    image_url: raw_data.carriers_dic[segment.Carrier].ImageUrl
                }
            }

            itinerary_data.push(segment_data.join("|"))
        })

        result_data.itineraries.push(itinerary_data.join("~~"))
    })
    result_data.itineraries = result_data.itineraries.sort(function (a, b) {
        return parseInt(a.split("~~")[1]) - parseInt(b.split("~~")[1])
    })
    return result_data
}


module.exports = skyscanner_engine_search

