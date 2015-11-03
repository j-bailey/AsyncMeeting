var mongoose = require('mongoose'),
    sinon = require('sinon');

var createConnStub = sinon.stub(mongoose, 'createConnection');
var userStub = sinon.stub();
var meetingAreaStub = sinon.stub();
var modelStub = sinon.stub();
userStub.returns();
createConnStub.returns({model: modelStub, on: sinon.spy()});
var MeetingArea = mongoose.model('MeetingArea', require('../../../../server/models/meetingArea').schema),
    User = mongoose.model('User', require('../../../../server/models/user').schema),
    Role = mongoose.model('Role', require('../../../../server/models/role').schema),
    Permission = mongoose.model('Permission', require('../../../../server/models/permission').schema),
    Meeting = mongoose.model('Meeting', require('../../../../server/models/meeting').schema);

modelStub.withArgs('User').returns(User);
modelStub.withArgs('MeetingArea').returns(MeetingArea);


