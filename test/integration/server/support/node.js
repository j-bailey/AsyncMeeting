/**
 * Created by jlb on 5/16/15.
 */

"use strict";

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var Q = require("q");
var path = require('path');

var sinon = require('sinon'),
    mock = require('mockery');
    //rewire = require("rewire");


require('../../../../config/configSetup');

if (!process.env.baseUrl){
    process.env.baseUrl = 'http://localhost:3001';
}
chai.Should();
chai.use(chaiAsPromised);

global.chaiAsPromised = chaiAsPromised;
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

global.fulfilledPromise = Q.resolve;
global.rejectedPromise = Q.reject;
global.defer = Q.defer;
global.waitAll = Q.all;

global.sinon = sinon;
global.mockery = mock;
//global.rewire = rewire;