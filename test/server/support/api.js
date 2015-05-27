var request = require('supertest');
var app = require('../../../app');

global.request = request(app);
