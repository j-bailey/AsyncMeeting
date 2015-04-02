var request = require('supertest');
var app = require('../../../app');

module.exports = request(app);
