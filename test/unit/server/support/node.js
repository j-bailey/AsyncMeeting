/**
 * Created by jlb on 5/16/15.
 */

"use strict";

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var Q = require("q");

var sinon = require('sinon');

require('../../../../config/configSetup');

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
