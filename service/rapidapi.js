const request = require("request")
const qs = require('querystring')

const config = process.argv[2] == 'production' ? require('../utils/config').production : require('../utils/config').development

const constant = require('../utils/constant')

function browserQuotes(params)
{
	// qs.stringify(params)
	const url = constant.url + constant.action.quotes + Object.values(params).join('/')
	console.log(url)
	const headers = { 'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com', 'x-rapidapi-key': config.rapid_key, 'content-type': 'application/x-www-form-urlencoded' }
	
	return new Promise(function (resolve, reject) {
		request.get(url, { headers: headers}, function (err, response, body) {
			require("fs").writeFileSync('./log/browserquotes.json', body)
			if (err) {
				reject("SERVER_REQ_ERR")
				return
			}
			switch (response.statusCode) {
				case 410: reject("SESSION_CODE_EXP"); break;
				case 200: resolve(JSON.parse(body)); break;
				default: reject(`${response.statusCode} SERVER_ERR`)
			}
		})
	})
}

function browserRoutes(params)
{
	// qs.stringify(params)
	const url = constant.url + constant.action.routes + Object.values(params).join('/')
	console.log(url)
	const headers = { 'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com', 'x-rapidapi-key': config.rapid_key, 'content-type': 'application/x-www-form-urlencoded' }
	
	return new Promise(function (resolve, reject) {
		request.get(url, { headers: headers}, function (err, response, body) {
			require("fs").writeFileSync('./log/browserroutes.json', body)
			if (err) {
				reject("SERVER_REQ_ERR")
				return
			}
			switch (response.statusCode) {
				case 410: reject("SESSION_CODE_EXP"); break;
				case 200: resolve(JSON.parse(body)); break;
				default: reject(`${response.statusCode} SERVER_ERR`)
			}
		})
	})
}

function browserDates(params)
{
	// qs.stringify(params)
	const url = constant.url + constant.action.dates + Object.values(params).join('/')
	console.log(url)
	const headers = { 'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com', 'x-rapidapi-key': config.rapid_key, 'content-type': 'application/x-www-form-urlencoded' }
	
	return new Promise(function (resolve, reject) {
		request.get(url, { headers: headers}, function (err, response, body) {
			require("fs").writeFileSync('./log/browserdates.json', body)
			if (err) {
				reject("SERVER_REQ_ERR")
				return
			}
			switch (response.statusCode) {
				case 410: reject("SESSION_CODE_EXP"); break;
				case 200: resolve(JSON.parse(body)); break;
				default: reject(`${response.statusCode} SERVER_ERR`)
			}
		})
	})
}

module.exports = { browserRoutes, browserQuotes, browserDates }
