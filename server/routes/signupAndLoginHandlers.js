"use strict";

var db = require('../db'),
    router = require('express').Router(),
    passport = require('passport'),
    securityUtils = require('../utils/securityUtils'),
    UserModel = db.readOnlyConnection.model('User'),
    requestIp = require('request-ip'),
    logger = require('winston');


/* Handle Login POST */
router.post('/login',
    passport.authenticate('login'),
    function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        UserModel.findById(req.user._id)
            .select('+tenantId')
            .populate('permissions')
            .populate('roles')
            .exec(function (err, user) {
                if (err){
                    logger.error('Error getting token. ' + err);
                    res.status(500);
                    res.json({
                        status: "error",
                        message: "Cannot login into the system right now. Please come back shierly.",
                        code: "00001"
                    });
                }
            var clientIp = requestIp.getClientIp(req);
            securityUtils.generateAccessToken(user.username, user.tenantId, [], clientIp,
                req.headers['user-agent'], user._id.toString()).then(function (accessToken) {
                res.json({
                    user: user, access_token: accessToken,
                    permissions: ['CanReadMeetingAreas', 'CanCreateMeetingAreas', 'CanViewMeetingAreas', 'CanDeleteMeetingAreas']
                });
                // TODO test permissions need to be removed after permissions are fixed
            }).done();

        });
    }
);

router.post('/email-login',
    passport.authenticate('email-login'),
    function (req, res) {
        // TODO Add better error handling
        //console.log("in email-logi POST");
        logger.debug("in email-login POST");
        res.setHeader('Content-Type', 'application/json');
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        UserModel.findById(req.user._id)
            .select('+tenantId')
            .populate('permissions')
            .populate('roles')
            .exec(function (err, user) {
                if (err){
                    logger.error('Error getting token. ' + err);
                    res.status(500);
                    res.json({
                        status: "error",
                        message: "Cannot login into the system right now. Please come back shierly.",
                        code: "00001"
                    });
                }
            logger.debug("Sending response");
            logger.debug("Getting accessToken");
            logger.debug('User = ' + JSON.stringify(user));
            var clientIp = requestIp.getClientIp(req);
            securityUtils.generateAccessToken(user.username, user.tenantId, [], clientIp,
                req.headers['user-agent'], user._id.toString()).then(function (accessToken) {
                res.json({
                    user: user, access_token: accessToken,
                    permissions: ['CanReadMeetingAreas', 'CanCreateMeetingAreas', 'CanViewMeetingAreas', 'CanDeleteMeetingAreas']
                });
                // TODO test permissions need to be removed after permissions are fixed
            }).done();
        });
    }
);

router.delete('/logout', function (req, res) {
        logger.debug("User logged out!");
        securityUtils.releaseAccessToken(req.access_token);
        req.logout(); // Passport logout
        req.session.destroy(); // Destroy session associated with user.
        res.sendStatus(200);
    }
);

/* Handle Registration POST */
router.post('/signup', function (req, res, next) {
    passport.authenticate('signup', function (err, user, info) {
        if (err) {
            return next(err);
        }

        logger.debug("info is " + info);
        logger.debug(info);

        if (!user) {
            logger.debug("res is " + res);
            return res.status(400).json({status:'error', message: info.message});
        }

        req.login(user, function (err) {
            if (err) {
                return next(err);
            }

            // TODO user is missing roles and permissions need to fix in passport signup code
            return res.json(user);
        });
    })(req, res, next);
});

module.exports = router;

