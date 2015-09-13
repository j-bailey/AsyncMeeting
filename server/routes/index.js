"use strict";

var router = require('express').Router(),
    routerErrorHandler = require('./routerErrorHandler'),
    passport = require('passport'),
    bodyParser = require('body-parser');


router.use(bodyParser.json());
router.use(require('../security/tokenSessionSetup'));
router.use(require('./signupAndLoginHandlers'));
router.use(function (req, res, next) {
    res.header('Cache-Control', 'no-cache="Set-Cookie, Set-Cookie2"');
    next();
});
//router.use('/api/sessions', require('./../controllers/api/sessions'));
router.use('/api/users', passport.authenticate('bearer', { session: true }), require('./../controllers/api/users'));
router.use('/api/meetingareas', passport.authenticate('bearer', { session: true }),  require('./../controllers/api/meetingAreas'));
router.use('/api/meetings', passport.authenticate('bearer', { session: true }),  require('./../controllers/api/meetings'));

// catch 404 and forward to error handler
router.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    err.msg = 'Not Found';
    next(err);
});

router.use(routerErrorHandler.handleValidationErrors);
router.use(routerErrorHandler.handleRouteErrors);
router.use(routerErrorHandler.handleAclHttpErrors);
router.use(routerErrorHandler.handleGenericErrors);

module.exports = router;
