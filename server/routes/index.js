var router = require('express').Router(),
    //routerUtils = require('./routerUtils'),
    //passport = require('passport'),
    bodyParser = require('body-parser');


router.use(bodyParser.json());
router.use(require('../auth'));
//router.use('/api/sessions', require('./../controllers/api/sessions'));
router.use('/api/users', require('./../controllers/api/users'));
//router.use(routerUtils.secureTokenCheck);
//router.use('/api/meetingareas', passport.authenticate('bearer', { session: false }), require('./../controllers/api/meetingAreas'));
router.use('/api/meetingareas', require('./../controllers/api/meetingAreas'));
router.use(require('./static'));
//router.use(routerUtils.logErrors);
//router.use(routerUtils.clientErrorHandler);
//router.use(routerUtils.errorHandler);

module.exports = router;
