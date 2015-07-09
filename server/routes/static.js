"use strict";

var router = require('express').Router(),
    passport = require('passport'),
    securityUtils = require('../security/securityUtils'),
    User = require('../../server/models/user'),
    logger = require('winston');


/* Handle Login POST */
router.post('/login',
    passport.authenticate('login'),
    function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        User.findPublicUserById(req.user._id).then(function (user) {
            securityUtils.generateAccessToken(user.username).then(function (accessToken) {
                res.json({
                    user: user, access_token: accessToken,
                    permissions: ['CanReadMeetingAreas', 'CanCreateMeetingAreas', 'CanViewMeetingAreas', 'CanDeleteMeetingAreas']
                });
                // TODO test permissions need to be removed after permissions are fixed
            }).catch(function (err) {
                logger.error('Error getting token. ' + err);
                res.status(500);
                res.json({
                    status: "error",
                    message: "Cannot login into the system right now. Please come back shierly.",
                    code: "00001"
                });
            });

        });
    }
);

router.post('/email-login',
    passport.authenticate('email-login'),
    function (req, res) {
        //console.log("in email-logi POST");
        logger.debug("in email-login POST");
        res.setHeader('Content-Type', 'application/json');
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        User.findPublicUserById(req.user._id).then(function (user) {
            logger.debug("Sending response");
            logger.debug("Getting accessToken");
            logger.debug('User = ' + JSON.stringify(user));
            securityUtils.generateAccessToken(user.username).then(function (accessToken) {
                res.json({
                    user: user, access_token: accessToken,
                    permissions: ['CanReadMeetingAreas', 'CanCreateMeetingAreas', 'CanViewMeetingAreas', 'CanDeleteMeetingAreas']
                });
                // TODO test permissions need to be removed after permissions are fixed
            }).catch(function (err) {
                logger.error('Error getting token. ' + err);
                res.status(500);
                res.json({
                    status: "error",
                    message: "Cannot login into the system right now. Please come back shierly.",
                    code: "00001"
                });
            });
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
            return res.status(400).json(info);
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

