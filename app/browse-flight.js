const express = require('express')
const rapidapi = require('../service/rapidapi')
const { mapping } = require('../utils/mapping')

const config = process.argv[2] == 'production' ? require('../utils/config').production : require('../utils/config').development
const browseFlight = express.Router()

// CONFIG ROUTE REQUEST
browseFlight.post("/browse-quotes", function (req, res) {
	var params = {
		country: 'ID',
		currency: 'IDR',
		locale: 'id-ID',
		originPlace: req.body['origin'] + "-sky",
		destinationPlace: req.body['destination'] + "-sky",
		outboundPartialDate: req.body['depart_date']
	}
	
	var requests = []
	requests.push(rapidapi.browserQuotes(params))
	
	if (req.body["return_date"]) {
		var tmp = params.originPlace
		params.outboundPartialDate = req.body["return_date"]
		params.originPlace = params.destinationPlace
		params.destinationPlace = tmp
		
		requests.push(rapidapi.browserQuotes(params))
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

browseFlight.post("/browse-routes", function (req, res) {
	var params = {
		country: 'ID',
		currency: 'IDR',
		locale: 'id-ID',
		originPlace: req.body['origin'] + "-sky",
		destinationPlace: req.body['destination'] + "-sky",
		outboundPartialDate: req.body['depart_date']
	}
	
	var requests = []
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
		
		var map = new mapping(results[0])
		result.depart_schedule = map.getFlightQuotes()
		result.return_schedule = null
		
		if (results.length > 1) {
			var map = new mapping(results[1])
			result.return_schedule = map.getFlightQuotes()
		}
		
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

browseFlight.post("/browse-dates", function (req, res) {
	var params = {
		country: 'ID',
		currency: 'IDR',
		locale: 'id-ID',
		originPlace: req.body['origin'] + "-sky",
		destinationPlace: req.body['destination'] + "-sky",
		outboundPartialDate: req.body['depart_date']
	}
	
	var requests = []
	requests.push(rapidapi.browserDates(params))
	
	if (req.body["return_date"]) {
		var tmp = params.originPlace
		params.outboundPartialDate = req.body["return_date"]
		params.originPlace = params.destinationPlace
		params.destinationPlace = tmp
		
		requests.push(rapidapi.browserDates(params))
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

module.exports = browseFlight
