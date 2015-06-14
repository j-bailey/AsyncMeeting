var MeetingArea = require('../../../../../../server/models/meetingArea');
var meetingAreaHandler = require('../../../../../../server/controllers/api/handlers/meetingAreasHandler');
var ObjectId = require('mongoose').Types.ObjectId;


describe('meeting area route', function () {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('getMeetingAreasWithParentId', function () {
        it('should return a meeting area', function (done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });
            var req = {query:{parentId: 1}},
                resSpy = {status: sinon.stub(), json: sinon.spy()},
                nextStub = sandbox.stub(),
                findStub = sandbox.stub(MeetingArea.base.Model, 'find');

            findStub.yields(null, meetingArea);
            resSpy.status.returns(resSpy);
            meetingAreaHandler.getMeetingAreasWithParentId(req, resSpy, nextStub);

            // TODO fix objectId issue
            //findStub.args[0][0].parentMeetingArea.should.equal({ parentMeetingArea: new ObjectId(1) });
            findStub.args[0][0].should.not.be.null;
            resSpy.status.args[0][0].should.equal(200);
            resSpy.json.args[0][0].should.deep.equal(meetingArea);
            done();
        });
    });

    describe('getMeetingArea', function () {
        it('should return a meeting area', function (done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });

            sandbox.stub(MeetingArea.base.Model, 'findOne').yields(null, meetingArea);

            var req = {params: {meetingAreaId: "1"}};
            var res = {
                status: function (status) {
                    expect(statusSpy.calledWith(200)).to.equal(true);
                    return this
                },
                json: function (json) {
                    expect(jsonSpy.calledWith(meetingArea)).to.equal(true);
                    done();
                }
            };

            var statusSpy = sandbox.spy(res, 'status');
            var jsonSpy = sandbox.spy(res, 'json');

            meetingAreaHandler.getMeetingArea(req, res);


        });
        it('should throw error when there is a find error', function (done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });
            var req = {params:{meetingAreaId: 1}},
                resSpy = {status: sinon.stub(), json: sinon.spy()},
                nextStub = sandbox.stub();

            sandbox.stub(MeetingArea.base.Model, 'findOne').yields('Big error during search', meetingArea);

            meetingAreaHandler.getMeetingArea(req, resSpy, nextStub);

            nextStub.args[0][0].should.equal('Big error during search');

            done();
        });
    });

    describe('createNewMeetingArea', function () {
        it('should create a meeting area', function (done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });

            var parentMeetingArea = new MeetingArea({
                title: "Parent Meeting Area Title",
                description: "Parent Meeting Area Description"
            });

            meetingArea.parentMeetingArea = parentMeetingArea._id;

            sandbox.stub(MeetingArea.prototype, 'save').yields(null, meetingArea);

            var req = {
                body: {
                    title: meetingArea.title,
                    description: meetingArea.description,
                    parentMeetingAreaId: parentMeetingArea.id
                }
            };

            var res = {
                status: function (status) {
                    expect(statusSpy.calledWith(201)).to.equal(true);
                    return this
                },
                json: function (json) {
                    expect(jsonSpy.calledWith(meetingArea)).to.equal(true);
                    done();
                }
            };

            var statusSpy = sandbox.spy(res, "status");
            var jsonSpy = sandbox.spy(res, "json");

            meetingAreaHandler.createNewMeetingArea(req, res);
        });
        it('should throw an promise error on save', function (done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });
            var parentMeetingArea = new MeetingArea({
                title: "Parent Meeting Area Title",
                description: "Parent Meeting Area Description"
            });
            var req = {body:{parentMeetingAreaId: 1}},
                resSpy = {status: sinon.stub(), json: sinon.spy()},
                saveStub = sandbox.stub(MeetingArea.prototype, 'save'),
                nextStub = sandbox.stub();

            meetingArea.parentMeetingArea = parentMeetingArea._id;

            saveStub.yields({message:"Big error!"}, meetingArea);

            meetingAreaHandler.createNewMeetingArea(req, resSpy, nextStub);

            // TODO Add winston log assertions
            // TODO fix next assertion
            //nextStub.args[0][0].should.equal({message:"Big error!"});
            expect(resSpy.status.args[0]).to.be.undefined;
            expect(resSpy.json.args[0]).to.be.undefined;

            done();
        });
    });

    describe('updateMeetingArea', function () {
        it('should update a meeting area', function (done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });
            var parentMeetingArea = new MeetingArea({
                title: "Parent Meeting Area Title",
                description: "Parent Meeting Area Description"
            });
            var req = {params:{meetingAreaId: 1, title:"My Title", description:"My desc"}},
                resSpy = {status: sinon.stub(), json: sinon.spy()},
                saveStub = sandbox.stub(meetingArea, 'save'),
                findOneStub = sandbox.stub(MeetingArea.base.Model, 'findOne'),
                nextStub = sandbox.stub();

            meetingArea.parentMeetingArea = parentMeetingArea._id;

            findOneStub.yields(undefined, meetingArea);
            saveStub.yields(undefined);

            meetingAreaHandler.updateMeetingArea(req, resSpy, nextStub);

            resSpy.status.args[0][0].should.equal(200);

            done();
        });
        it('should throw an error via promise', function (done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });
            var parentMeetingArea = new MeetingArea({
                title: "Parent Meeting Area Title",
                description: "Parent Meeting Area Description"
            });
            var req = {params:{meetingAreaId: 1, title:"My Title", description:"My desc"}},
                resSpy = {status: sinon.stub(), json: sinon.spy()},
                saveStub = sandbox.stub(meetingArea, 'save'),
                findOneStub = sandbox.stub(MeetingArea.base.Model, 'findOne'),
                nextStub = sandbox.stub();

            meetingArea.parentMeetingArea = parentMeetingArea._id;

            findOneStub.yields({message:"error finding item"}, meetingArea);
            saveStub.yields(undefined);

            meetingAreaHandler.updateMeetingArea(req, resSpy, nextStub);

            nextStub.args[0][0].should.deep.equal({message:"error finding item"});
            expect(resSpy.status.args[0]).to.be.undefined;

            done();
        });
        it('should throw and error via promise on save', function (done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });
            var parentMeetingArea = new MeetingArea({
                title: "Parent Meeting Area Title",
                description: "Parent Meeting Area Description"
            });
            var req = {params:{meetingAreaId: 1, title:"My Title", description:"My desc"}},
                resSpy = {status: sinon.stub(), json: sinon.spy()},
                saveStub = sandbox.stub(meetingArea, 'save'),
                findOneStub = sandbox.stub(MeetingArea.base.Model, 'findOne'),
                nextStub = sandbox.stub();

            meetingArea.parentMeetingArea = parentMeetingArea._id;

            findOneStub.yields(undefined, meetingArea);
            saveStub.yields({message:"error saving item"});

            meetingAreaHandler.updateMeetingArea(req, resSpy, nextStub);

            nextStub.args[0][0].should.deep.equal({message:"error saving item"});
            expect(resSpy.status.args[0]).to.be.undefined;

            done();
        });
    });

    describe('deleteMeetingArea', function () {
        it('should update a meeting area', function (done) {
            var req = {params:{meetingAreaId: 1, title:"My Title", description:"My desc"}},
                resSpy = {sendStatus: sinon.stub(), json: sinon.spy()},
                findOneAndRemoveStub = sandbox.stub(MeetingArea.base.Model, 'findOneAndRemove'),
                nextStub = sandbox.stub();

            findOneAndRemoveStub.yields(undefined);

            meetingAreaHandler.deleteMeetingArea(req, resSpy, nextStub);

            resSpy.sendStatus.args[0][0].should.equal(200);

            done();
        });
        it('should update a meeting area', function (done) {
            var req = {params:{meetingAreaId: 1, title:"My Title", description:"My desc"}},
                resSpy = {sendStatus: sinon.stub(), json: sinon.spy()},
                findOneAndRemoveStub = sandbox.stub(MeetingArea.base.Model, 'findOneAndRemove'),
                nextStub = sandbox.stub();

            findOneAndRemoveStub.yields({message:"error trying to remove item"});

            meetingAreaHandler.deleteMeetingArea(req, resSpy, nextStub);

            nextStub.args[0][0].should.deep.equal({message:"error trying to remove item"});
            expect(resSpy.sendStatus.args[0]).to.be.undefined;

            done();
        });
    });

    //describe('POST \'/\'', function() {
    //    it('should create a meeting area', function(done) {
    //        request
    //            .post('/api/meetingarea')
    //            .send({
    //                parentMeetingAreaId: meetingAreaId,
    //                title: "New Meeting Area",
    //                description: "New Meeting Area Description"
    //            })
    //            .set('Accept', 'application/json')
    //            .expect('Content-Type', /json/)
    //            .expect(201)
    //            .end(function(err, res) {
    //                var result = JSON.parse(res.text);
    //                expect(result._id).to.not.be.null;
    //                MeetingArea.find({}, function(err, meetingAreas) {
    //                    expect(meetingAreas).to.have.length(2);
    //                    done();
    //                });
    //            });
    //    });
    //});
    //
    //describe('DELETE \'/\'', function() {
    //    it('should remove a meeting area', function(done) {
    //        request
    //            .delete('/api/meetingarea/' + meetingAreaId)
    //            .expect(200)
    //            .end(function(err, res) {
    //                MeetingArea.find({}, function (err, meetingAreas) {
    //                    expect(meetingAreas).to.be.empty;
    //                    done();
    //                });
    //            });
    //    });
    //});
});
