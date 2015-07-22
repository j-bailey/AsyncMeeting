var logger = require('winston'),
    mongoose = require('mongoose'),
    MeetingArea = mongoose.model('MeetingArea', require('../../../../../../server/models/meetingArea').schema),
    meetingAreaHandler = require('../../../../../../server/controllers/api/handlers/meetingAreasHandler');


describe('meeting area route', function () {
    var sandbox,
        prevError,
        errorLogSpy;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        prevError = logger.error;
        errorLogSpy = sandbox.stub();
        logger.error = errorLogSpy;

    });

    afterEach(function () {
        sandbox.restore();
        logger.error = prevError;
    });

    describe('getMeetingAreasWithParentId', function () {
        it('should return a meeting area', function (done) {
            var parentMeetingArea = new MeetingArea({
                title: "Parent Meeting Area Title",
                description: "Parent Meeting Area Description"
            });
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });

            var
                resSpy = {status: sandbox.stub(), json: sandbox.spy()},
                findReturn = {select:sandbox.stub()},
                execStub = {exec:sandbox.stub()},
                nextStub = sandbox.stub(),
                findOneStub = sandbox.stub(),
                findStub = sandbox.stub(),
                req = {query:{parentId: '123456789012345678901234'}, db:{model: sandbox.stub()}};

            req.db.model.returns({find: findStub, findOne: findOneStub});
            findOneStub.yields(null, parentMeetingArea);
            execStub.exec.yields(null, meetingArea);
            findReturn.select.returns(execStub);
            findStub.returns(findReturn);
            resSpy.status.returns(resSpy);
            meetingAreaHandler.getMeetingAreasWithParentId(req, resSpy, nextStub);

            // TODO fix objectId issue
            //findStub.args[0][0].parentMeetingArea.should.equal({ parentMeetingArea: new ObjectId(1) });
            findOneStub.args[0][0].should.deep.equal({_id: '123456789012345678901234'});
            findStub.args[0][0].should.not.be.null;
            resSpy.status.args[0][0].should.equal(200);
            resSpy.json.args[0][0].should.deep.equal(meetingArea);

            done();
        });
        it('should return error via promise for null in string', function (done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });

            var resSpy = {status: sandbox.stub(), json: sandbox.spy()},
                findReturn = {select:sandbox.stub()},
                execStub = {exec:sandbox.stub()},
                nextStub = sandbox.stub(),
                findOneStub = sandbox.stub(),
                findStub = sandbox.stub(),
                req = {query:{parentId: 'null'}, db:{model: sandbox.stub()}};

            req.db.model.returns({find: findStub, findOne: findOneStub});
            execStub.exec.yields(null, meetingArea);
            findReturn.select.returns(execStub);
            findStub.returns(findReturn);
            resSpy.status.returns(resSpy);
            meetingAreaHandler.getMeetingAreasWithParentId(req, resSpy, nextStub);

            findStub.args[0][0].should.be.deep.equal({ parentMeetingArea: null });
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

            var execStub = {exec:sandbox.stub().yields(null, meetingArea)},
                selectStub = {select:sandbox.stub().returns(execStub)},
                findOneStub = sandbox.stub().returns(selectStub);


            var req = {params: {meetingAreaId: "1"}, db:{model: sandbox.stub()}};
            req.db.model.returns({findOne: findOneStub});
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

            meetingAreaHandler.getMeetingAreaById(req, res);


        });
        it('should throw error when there is a find error', function (done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });
            var resSpy = {status: sinon.stub(), json: sinon.spy()},
                nextStub = sandbox.stub();

            var execStub = {exec:sandbox.stub().yields('Big error during search', meetingArea)},
                selectStub = {select:sandbox.stub().returns(execStub)},
                findOneStub = sandbox.stub().returns(selectStub),
                req = {params:{meetingAreaId: 1}, db:{model: sandbox.stub()}};
            req.db.model.returns({findOne: findOneStub});
            meetingAreaHandler.getMeetingAreaById(req, resSpy, nextStub);

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
            var findOneStub = sandbox.stub().yields(null, {_id:'123456789012'});

            var req = {
                body: {
                    title: meetingArea.title,
                    description: meetingArea.description,
                    parentMeetingAreaId: parentMeetingArea.id
                },
                db:{model: sandbox.stub()}
            };

            req.db.model.returns(MeetingArea);

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

            done();
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
            var req = {body:{parentMeetingAreaId: 1}, db:{model: sandbox.stub()}},
                resSpy = {status: sinon.stub(), json: sinon.spy()},
                saveStub = sandbox.stub(MeetingArea.prototype, 'save'),
                nextStub = sandbox.stub();

            req.db.model.returns(MeetingArea);
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
            var req = {params: {meetingAreaId: '332b624f-ccd0-4bf8-ba1b-64aa326314ec'},
                    body:{title:"My Title", description:"My desc"}, db:{model: sandbox.stub()}},
                resSpy = {status: sinon.stub(), json: sinon.spy()},
                findOneAndUpdateStub = sandbox.stub(MeetingArea.base.Model, 'findOneAndUpdate'),
                nextStub = sandbox.stub();

            req.db.model.returns(MeetingArea);

            meetingArea.parentMeetingArea = parentMeetingArea._id;

            findOneAndUpdateStub.yields(undefined, meetingArea);
            resSpy.status.returns(resSpy);

            meetingAreaHandler.updateMeetingAreaById(req, resSpy, nextStub);

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
            var req = {params:{meetingAreaId: 1}, body:{title:"My Title", description:"My desc"}, db:{model: sandbox.stub()}},
                resSpy = {status: sinon.stub(), json: sinon.spy()},
                findOneAndUpdateStub = sandbox.stub(MeetingArea.base.Model, 'findOneAndUpdate'),
                nextStub = sandbox.stub();

            req.db.model.returns(MeetingArea);
            meetingArea.parentMeetingArea = parentMeetingArea._id;

            findOneAndUpdateStub.yields({message:"error finding item"}, meetingArea);

            meetingAreaHandler.updateMeetingAreaById(req, resSpy, nextStub);

            nextStub.args[0][0].should.deep.equal({message:"error finding item"});
            expect(resSpy.status.args[0]).to.be.undefined;

            done();
        });
    });

    describe('deleteMeetingArea', function () {
        it('should delete a meeting area', function (done) {
            var req = {params:{meetingAreaId: 1, title:"My Title", description:"My desc"}, db:{model: sandbox.stub()}},
                resSpy = {sendStatus: sinon.stub(), json: sinon.spy()},
                findOneAndRemoveStub = sandbox.stub(MeetingArea.base.Model, 'findOneAndRemove'),
                nextStub = sandbox.stub();

            findOneAndRemoveStub.yields(undefined);
            req.db.model.returns(MeetingArea);

            meetingAreaHandler.deleteMeetingAreaById(req, resSpy, nextStub);

            resSpy.sendStatus.args[0][0].should.equal(200);

            done();
        });
        it('should throw an error', function (done) {
            var req = {params:{meetingAreaId: 1, title:"My Title", description:"My desc"}, db:{model: sandbox.stub()}},
                resSpy = {sendStatus: sinon.stub(), json: sinon.spy()},
                findOneAndRemoveStub = sandbox.stub(MeetingArea.base.Model, 'findOneAndRemove'),
                nextStub = sandbox.stub();

            findOneAndRemoveStub.yields({message:"error trying to remove item"});
            req.db.model.returns(MeetingArea);

            meetingAreaHandler.deleteMeetingAreaById(req, resSpy, nextStub);

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
