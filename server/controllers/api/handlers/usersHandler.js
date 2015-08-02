"use strict";

var logger = require('winston');

module.exports = {
    createUser: function (req, res, next) {
        var User = req.db.model('User');
        var user = new User(req.body);
        User.createNewSignedUpUser(user).then(function (newUser) {
            User.findById(newUser._id);
            res.status(201).json(newUser);
        }).catch(function (err) {
            if(err.errors) {
                logger.error(err.errors);
            }
            next(err);
        });
    },
    quickSearchForUser: function (req, res, next) {
        var serachCriteria = req.body.searchCriteria;
        var User = req.db.model('User');

        /* jshint ignore:line */
        User.quickFind(serachCriteria).then(function (users) {
            res.json(JSON.stringify(users));
        }).catch(function (err) {
            logger.error('Error trying to do a quick search for user with search criteria: ' + serachCriteria + ' with error: ' + err);
            return next(err);
        });
    },
    findById: function (req, res, next) {
        var User = req.db.model('User');
        User.findOne({_id: req.params.id})
            .exec(function (err, user) {
                if (err) {
                    return next(err);
                }
                res.status(200).json(user);
            });
    },
    updateById: function (req, res, next) {
        var id = req.params.id;
        var userObj = req.body;
        delete userObj._id;
        delete userObj.id;

        var search = {_id: id};
        var update = userObj;
        var options = {new: true};

        var User = req.db.model('User');
        User.findOneAndUpdate(search, update, options)
            .exec(function (err, updatedUser) {
                if (err) {
                    next(err);
                }
                if (updatedUser === null) {
                    res.status(409).json({});
                } else {
                    res.status(200).json(updatedUser);
                }
            });
    },
    deleteById: function (req, res, next) {
        var id = req.params.id;
        var User = req.db.model('User');

        User.findOneAndRemove({_id: id}, function (err) {
            if (err) {
                return next(err);
            }
            res.sendStatus(200);
        });
    }
};
