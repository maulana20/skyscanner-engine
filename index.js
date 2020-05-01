const express = require('express')
const config = process.argv[2] == 'production' ? require('./utils/config').production : require('./utils/config').development

const app = express()

// CONFIG MIDDLEWARE
app.use(require('body-parser').json())
app.use(require('body-parser').urlencoded({ extended: false }))
app.use(require('multer')().array())

// IP ADDRESS FILTER
app.use(function (req, res, next) {
	var client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (config.allow_ips.indexOf(client_ip) >= 0) return next()
	
	res.json({
		status: "FAILED",
		message: "Connection forbidden",
		content: { client_ip: client_ip },
		reason: "RESTRICTED_CONTENT"
	})
})

// ROUTE CONFIG
app.use('/search', require("./app/browser-flight"))

// RUN APPS
app.listen(config.port, config.host, 511, function () {
	console.log("application run successfully on " + config.host + ":" + config.port)
})
