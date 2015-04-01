var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jwt-simple');
var config = require('../../config');
var User = require('../../server/models/user');
var logger = require('winston');

/* Handle Login POST */
router.post('/login',
    passport.authenticate('login'),
    function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        var token = jwt.encode({username: req.user.username}, config.secret);
        User.findPublicUserById(req.user._id).then(function(user) {
            res.json({user:user, token: token, permissions:['CanReadMeetingAreas', 'CanCreateMeetingAreas', 'CanViewMeetingAreas', 'CanDeleteMeetingAreas']});  // TODO test permissions need to be removed after permissions are fixed
        });
    }
);

router.post('/email-login',
    passport.authenticate('email-login'),
    function(req, res) {
        //console.log("in email-logi POST");
        logger.debug("in email-login POST");
        res.setHeader('Content-Type', 'application/json');
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        var token = jwt.encode({username: req.user.username}, config.secret);
        User.findPublicUserById(req.user._id).then(function(user) {
            logger.debug("Sending response");
            res.json({user:user, token: token, permissions:['CanReadMeetingAreas', 'CanCreateMeetingAreas', 'CanViewMeetingAreas', 'CanDeleteMeetingAreas']});  // TODO test permissions need to be removed after permissions are fixed
        });
    }
);

router.delete('/logout', function(req, res) {
        logger.debug("User logged out!");
        req.logout(); // Passport logout
        req.session.destroy(); // Destroy session associated with user.
        res.sendStatus(200);
    }
);

/* Handle Registration POST */
router.post('/signup', function(req, res, next) {
   passport.authenticate('signup', function(err, user, info) {
       if ( err ) {
           return next(err);
       }

       logger.debug("info is " + info);
       logger.debug(info);

       if ( !user ) {
           logger.debug("res is " + res);
           return res.status(400).json(info);
       }

       req.login(user, function(err) {
           if (err) return next(err);

           // TODO user is missing roles and permissions need to fix in passport signup code
           return res.json(user);
       });
   })(req, res, next);
});



module.exports = router;

