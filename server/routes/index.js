"use strict";

var router = require('express').Router(),
    routerUtils = require('./routerUtils'),
    passport = require('passport'),
    bodyParser = require('body-parser');


router.use(bodyParser.json());
router.use(require('../auth'));
router.use(require('./static'));
//router.use('/api/sessions', require('./../controllers/api/sessions'));
router.use('/api/users', passport.authenticate('bearer', { session: false }), require('./../controllers/api/users'));
router.use('/api/meetingareas', passport.authenticate('bearer', { session: false }),  require('./../controllers/api/meetingAreas'));

// catch 404 and forward to error handler
router.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    err.msg = 'Not Found';
    next(err);
});

router.use(routerUtils.handleErrors);

module.exports = router;
