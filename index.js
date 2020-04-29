const express = require('express')
const application_env = process.argv[2]
const config = require('./__config')[application_env || 'development']
if (!config) {
    const config = require('./__config')['development']
}

// INITIATE EXPRESS APPS
const skyscanner_engine = express()

// CONFIG MIDDLEWARE
skyscanner_engine.use(require('body-parser').json())
skyscanner_engine.use(require('body-parser').urlencoded({ extended: false }))
skyscanner_engine.use(require('multer')().array())


// IP ADDRESS FILTER
skyscanner_engine.use(function (req, res, next) {
    var client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (config.allow_ips.indexOf(client_ip) >= 0) {
        return next()
    }
    res.json({
        status: "FAILED",
        message: "Connection forbidden",
        content: {
            client_ip: client_ip
        },
        reason: "RESTRICTED_CONTENT"
    })
})

// ROUTE CONFIG
skyscanner_engine.use('/search', require("./app/search.route"))
skyscanner_engine.use("/airport", require("./app/airport.route"))
skyscanner_engine.use("/cache", require("./app/cache.route"))

// RUN APPS
skyscanner_engine.listen(config.port, config.host, 511, function () {
    console.log("SkyScanner Engine run successfully on " + config.host + ":" + config.port)
})