var express = require('express')
var request = require('supertest')
var router = require('../../../server/controllers')
var app = express()

app.use(router)
module.exports = request(app)
