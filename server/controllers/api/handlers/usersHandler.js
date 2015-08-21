"use strict";

var logger = require('winston');
var db = require('../../../../server/db');
var Q = require('q');
var acl = require('../../../security/acl'),
    freeTier = require('../../../security/resources/free-tier-role');



var createNewSignedUpUser = function (newUser) {
    var defer = Q.defer();
    var Tenant = db.readOnlyConnection.model('Tenant');
    var MeetingArea = db.readOnlyConnection.model('MeetingArea');
    var UserAllowedResources = db.readWriteConnection.model('UserAllowedResources');
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
        firstMeetingArea.save(function (err, savedArea) {
            if (err) {
                logger.error('Error in saving meeing area for new tenant: ' + err);
                return defer.reject({message: "We're sorry, we could not create your account at this time!"});
            }
            acl.getAcl().addUserRoles(newUser.username, freeTier.object.key);
            newUser.tenantId = savedTenant._id;

            newUser.save(function (err, savedUser) {
                if (err) {
                    logger.error('Error in Saving user: ' + err);
                    savedTenant.remove(function (err) {
                        if (err) {
                            logger.error('Unable to delete Tenant for new user with ID: ' + savedTenant._id);
                        }
                        savedArea.remove(function (err) {
                            if (err) {
                                logger.error('Unable to delete Meeting Area for new user with ID: ' + savedTenant._id);
                            }
                            return defer.reject({message: "We're sorry, we could not create your account at this time!"});
                        });
                    });
                }
                var allowedResources = {
                    userId: savedUser._id,
                    tenantId: savedTenant._id,
                    resourceId: savedArea._id,
                    resourceType: 'MeetingArea'
                };
                var allowedResources = new UserAllowedResources(allowedResources);
                allowedResources.save(function (err, savedAllowedResources) {
                    if (err) {
                        logger.error(err);
                        savedTenant.remove(function (err) {
                            if (err) {
                                logger.error('Unable to delete Tenant for new user with ID: ' + savedTenant._id);
                            }
                            savedArea.remove(function (err) {
                                if (err) {
                                    logger.error('Unable to delete Meeting Area for new user with ID: ' + savedTenant._id);
                                }
                                return defer.reject({message: "We're sorry, we could not create your account at this time!"});
                            });
                        });
                    }
                    logger.debug('User Registration successful');
                    db.readOnlyConnection.model('User').findById(savedUser._id).lean().exec(function (err, safeUser) {
                        if (err) {
                            logger.error('Error in Saving user: ' + err);
                            savedTenant.remove(function (err) {
                                if (err) {
                                    logger.error('Unable to delete Tenant for new user with ID: ' + savedTenant._id);
                                }
                                savedArea.remove(function (err) {
                                    if (err) {
                                        logger.error('Unable to delete Meeting Area for new user with ID: ' + savedTenant._id);
                                    }
                                    return defer.reject({message: "We're sorry, we could not create your account at this time!"});
                                });
                            });
                        }
                        defer.resolve(safeUser);
                    });
                });
            });
        });
    });
    return defer.promise;
};

module.exports = {
    createNewSignedUpUser:createNewSignedUpUser,
    createUser: function (req, res, next) {
        var User = req.db.model('User');
        var user = new User(req.body);
        createNewSignedUpUser(user).then(function (newUser) {
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
