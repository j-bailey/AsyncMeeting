"use strict";

var logger = require('winston');
var db = require('../../../../server/db');
var Q = require('q');
var meetingAreaHandler = require('../../../../server/controllers/api/handlers/meetingAreasHandler');
var secUtils = require('../../../../server/security/securityUtils');
var jsonResponse = require('../../../utils/jsonResponseWrapper');
var handlerUtils = require('./handlerUtils');


var createNewSignedUpUser = function (newUser) {
    var defer = Q.defer();
    var Tenant = db.readOnlyConnection.model('Tenant');
    var MeetingArea = db.readOnlyConnection.model('MeetingArea');
    var newTenantName = Tenant.createPersonalTenantName(newUser.username);
    var newTenant = new Tenant({
        name: newTenantName,
        type: Tenant.PERSONAL_TYPE,
        description: 'Personal tenant created by Signup'
    });
    newTenant.save(function (err, savedTenant) {
        if (err) {
            logger.error('Error in saving new tenant: ' + err);
            return defer.reject({message: "We're sorry, we could not create your account at this time!"});
        }
        logger.debug('new tenant ' + savedTenant + ' has been saved');
        var firstMeetingArea = new MeetingArea({
            title: 'My First Meeting Area',
            description: 'This is your meeting area, which can contain multiple meetings and other areas.  ' +
            'Please feel to change me or add to me.',
            parentMeetingArea: null,
            ancestors: [],
            tenantId: savedTenant._id
        });
        newUser.tenantId = savedTenant._id;

        newUser.save(function (err, savedUser) {
            if (err) {
                logger.error('Error in Saving user: ' + err);
                savedTenant.remove(function (e) {
                    if (e) {
                        logger.error('Unable to delete Tenant for new user with ID: ' + savedTenant._id);
                    }
                });
                return defer.reject(err);
            }
            meetingAreaHandler._createMeetingArea(firstMeetingArea, savedUser.username, db.readWriteConnection, true).then(function () {
                logger.debug('User Registration successful');
                db.readOnlyConnection.model('User').findById(savedUser._id).lean().exec(function (err, safeUser) {
                    if (err) {
                        logger.error('Error in Saving user: ' + err);
                        savedTenant.remove(function (err) {
                            if (err) {
                                logger.error('Unable to delete Tenant for new user with ID: ' + savedTenant._id);
                            }
                            // TODO need better clean up
                        });
                    }
                    defer.resolve(safeUser);
                });
            }).catch(function(err){
                // TODO review error handling
                return defer.reject(err);
            });
        });
    });
    return defer.promise;
};

module.exports = {
    createNewSignedUpUser: createNewSignedUpUser,
    isInvalidPassword: function(req, res, next) {
        try {
            var result = secUtils.isInvalidPassword(req.params.password, req.query.username || req.session.userId);
            return res.status(200).json(jsonResponse.successResponse({result: result}));
        } catch (e){
            next(handlerUtils.catchError(e, 'Unable to check password validity right now, please later.'));
        }
    },
    isInvalidUsername: function(req, res, next) {
        try {
            var User = req.db.model('User');
            var result = User.schema.statics.isInvalidUsername(req.params.username);
            return res.status(200).json(jsonResponse.successResponse({result: result}));
        } catch (e){
            next(handlerUtils.catchError(e, 'Unable to check username validity right now, please later.'));
        }
    },
    createUser: function (req, res, next) {
        try {
            var User = req.db.model('User');
            var user = new User(req.body);
            createNewSignedUpUser(user).then(function (newUser) {
                User.findById(newUser._id);
                res.status(201).json(jsonResponse.successResponse(newUser));
            }).catch(function (err) {
                next(handlerUtils.catchError(err, 'Unable to create user right now, please try again later.'));
            });
        } catch(e){
            next(handlerUtils.catchError(e, 'Unable to check username validity right now, please later.'));
        }
    },
    quickSearchForUser: function (req, res, next) {
        try {
            var serachCriteria = req.body.searchCriteria;
            var User = req.db.model('User');

            /* jshint ignore:line */
            User.quickFind(serachCriteria).then(function (users) {
                res.json(jsonResponse.successResponse(JSON.stringify(users)));
            }).catch(function (err) {
                next(handlerUtils.catchError(err, 'Error trying to do a quick search for user with search criteria: ' + serachCriteria));
            });
        } catch (e){
            next(handlerUtils.catchError(e, 'Error trying to do a quick search for user'));
        }
    },
    findById: function (req, res, next) {
        try {
            var User = req.db.model('User');
            User.findOne({_id: req.params.id})
                .exec(function (err, user) {
                    if (err) {
                        return next(handlerUtils.catchError(err, 'Error trying to find user, please try again later'));
                    }
                    res.status(200).json(jsonResponse.successResponse(user));
                });
        } catch (e){
            next(handlerUtils.catchError(e, 'Error trying to find user, please try again later'));
        }
    },
    updateById: function (req, res, next) {
        try {
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
                        res.status(409).json(jsonResponse.successResponse({}));
                    } else {
                        res.status(200).json(jsonResponse.successResponse(updatedUser));
                    }
                });
        } catch (e){
            next(handlerUtils.catchError(e, 'Error trying to update user, please try again later'));
        }
    },
    deleteById: function (req, res, next) {
        try {
            var id = req.params.id;
            var User = req.db.model('User');

            User.findOneAndRemove({_id: id}, function (err) {
                if (err) {
                    return next(handlerUtils.catchError(err, 'Error trying to update user, please try again later'));
                }
                res.sendStatus(200);
            });
        } catch (e){
            next(handlerUtils.catchError(e, 'Error trying to update user, please try again later'));
        }
    }
};
