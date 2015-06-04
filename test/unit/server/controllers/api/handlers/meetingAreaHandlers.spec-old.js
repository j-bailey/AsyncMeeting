/**
 * Created by jlb on 6/2/15.
 */

var meetingAreaHandlers;

describe('meetingAreaHandler', function () {
    var mockgoose = require('mockgoose'),
        mongoose = require('mongoose');

    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/asyncmeeting_test');

    var MeetingArea = require('../../../../../../server/models/meetingArea')(mongoose);
    var createdDate = new Date(),
        parentMA = {title:'Parent title', description:'Parent description', createdOn: createdDate, modifiedOn: createdDate},
        childMA = {title:'Child title', description:'Child description', createdOn: createdDate, modifiedOn: createdDate},
        savedParent = {},
        savedChild = {},
        parentId = '';

    beforeEach(function (done) {
        meetingAreaHandlers = require(__dirname + '/../../../../../../server/controllers/api/handlers/meetingAreaHandlers')(MeetingArea);            // Load your module under test
        mockgoose.reset();

        MeetingArea.create(
            parentMA,
            childMA,
            function (err, parent, child) {
                expect(err).not.to.be.ok;
                expect(parent).to.be.ok;
                parentId = parent._id;
                savedParent = parent;
                expect(child).to.be.ok;
                savedChild = child;
                done();
            }
        );
    });

    afterEach(function (done) {
        mockgoose.reset();
        done();
    });

    describe('getMeetingArea', function() {
        it('should get a meeting area from the handler', function (done) {
            var req = {
                params: {
                    meetingsAreaId: savedParent._id
                }
            };
            var res = {
                status: function (status) {
                    status.should.equal(200);
                    return {
                        json: function(ma) {
                            expect(ma).to.deep.equal(savedParent);
                            done();
                        }
                    }
                }
            };
            meetingAreaHandlers.getMeetingArea(req, res);
        });

        it('should not get a meeting area from the handler', function (done) {
            var newId = parentId + 'AD',
                req = {
                params: {
                    meetingsAreaId: newId
                }
            };
            var res = {
                status: function (status) {
                    done('Should not be called');
                }
            };
            meetingAreaHandlers.getMeetingArea(req, res);
        });
    });
});