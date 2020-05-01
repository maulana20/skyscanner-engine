const express = require('express')
const rapidapi = require('../service/rapidapi')

const config = process.argv[2] == 'production' ? require('../utils/config').production : require('../utils/config').development
const browserFlight = express.Router()

// CONFIG ROUTE REQUEST
browserFlight.post("/routes", function (req, res) {
	var params = {}
	var requests = []
	
	params.country = 'ID'
	params.currency = 'IDR'
	params.locale = 'id-ID'
	params.originPlace = req.body['origin'] + "-sky"
	params.destinationPlace = req.body['destination'] + "-sky"
	params.outboundPartialDate = req.body['depart_date']
	
	requests.push(rapidapi.browserRoutes(params))
	
	if (req.body["return_date"]) {
		var tmp = params.originPlace
		params.outboundPartialDate = req.body["return_date"]
		params.originPlace = params.destinationPlace
		params.destinationPlace = tmp
		
		requests.push(rapidapi.browserRoutes(params))
	}
	
	Promise.all(requests).then(function (results) {
		var result = {}
		result.depart_schedule = results[0]
		result.return_schedule = null
		
		if (results.length > 1) result.return_schedule = results[1]
		
		res.json({
			status: "SUCCESS",
			message: "Search result retrieved successfully",
			content: result,
			reason: null
		})
	}).catch(function (err_code) {
		res.json({
			status: "FAILED",
			message: "Failed get search result",
			content: null,
			reason: err_code
		})
	})
})

module.exports = browserFlight
