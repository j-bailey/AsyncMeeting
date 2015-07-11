"use strict";

var User = require('../../../../server/models/user');
var logger = require('winston');

module.exports = {
    createUser: function (req, res, next) {
        var user = new User(req.body),
            hashedPassword = User.hashPassword(req.body.password);
        /* jshint ignore:line */
        user.password = hashedPassword;
        user.save(function (err, savedUser) {
            if (err) {
                return next(err);
            }
            res.status(201).json(savedUser);
        });
    },
    quickSearchForUser: function (req, res, next) {
        var serachCriteria = req.body.searchCriteria;
        /* jshint ignore:line */
        User.quickFind(serachCriteria).then(function (users) {
            res.json(JSON.stringify(users));
        }).catch(function (err) {
            logger.error('Error trying to do a quick search for user with search criteria: ' + serachCriteria + ' with error: ' + err);
            return next(err);
        });
    },
    findByUuid: function(req, res, next){
        User.findOne({uuid: req.params.uuid}, function (err, user) {
            if (err) {
                return next(err);
            }
            res.status(200).json(user);
        });
    },
    updateByUuid: function(req, res, next){
        var uuid = req.params.uuid;
        var userObj = req.params;
        delete userObj._id;
        delete userObj.uuid;
        User.update({uuid: uuid}, userObj, function(err, raw){
            if (err){
                logger.error('User update error: ' + raw);
                next(err);
            } else {
                User.findOne({uuid: uuid}, function(err, user){
                    if (err) {
                        return next(err);
                    }
                    res.status(200).json(user);
                });
            }
        });
    },
    deleteByUuid: function(req, res, next){
        var uuid = req.params.uuid;
        User.findOneAndRemove({ uuid: uuid }, function(err) {
            if (err) { return next(err); }
            res.sendStatus(200);
        });
    }
};
