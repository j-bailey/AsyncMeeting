describe('routes', function() {
    var sandbox;
    function functionName(fun) {
        var ret = fun.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    }


    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    // TODO figure out how to speed up this test
    //describe('index', function() {
    //    it('should have all my server routes declared', function(done) {
    //        var aa = require('express').Router();
    //        var routerStub = sandbox.stub(require('express').Router().__proto__, 'use'),
    //            //bodyParserStub = sandbox.stub(a, 'json'),
    //            authStub = sinon.createStubInstance(require('../../../../server/auth')),
    //            sessionStub = sinon.createStubInstance(require('../../../../server/controllers/api/sessions')),
    //            userStub = sinon.createStubInstance(require('../../../../server/controllers/api/users')),
    //            maStub = sinon.createStubInstance(require('../../../../server/controllers/api/meetingAreas')),
    //            staticStub = sinon.createStubInstance(require('../../../../server/routes/static'));
    //        //bodyParserStub.returns('jsonParser');
    //
    //        require('../../../../server/routes/index');
    //        var a = routerStub.getCall(0).args[0];
    //        function jsonParser(req, res, next){};
    //        expect(functionName(routerStub.getCall(0).args[0])).to.equal('jsonParser');
    //        //expect(routerStub.getCall(1).args[0]).to.equal(authStub);
    //        done();
    //
    //    });
    //});
});


