"use strict";

var mongoose = require('mongoose');
var nodeUuid = require('node-uuid');
var db = require('../../db');
var Q = require('q');

module.exports = exports = function trashable(schema) {
    schema.add({
        originalName: {type: String, required: false, default: '', select: false},
        inTheTrash: {type: Boolean, required: true, default: false, select: true},
        trashedOnDate: {type: Date, required: false, select: false},
        trashedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, select: false},
        trashSetIds: {type: [String], default: [], required: false, select: false},
        isRootTrashedItem: {type: Boolean, required: true, default: false, select: false}
    });

    schema.pre('validate', function (next) {
        var doc = this,
            promises = [];

        if (doc.isModified('inTheTrash')) {
            var tokens,
                modelName,
                prop,
                model,
                i,
                tId,
                direction,
                query = {};

            if (doc.inTheTrash) {
                doc.trashedOnDate = new Date();
                if (doc.name) {
                    doc.originalName = doc.name;
                    doc.name = doc.name + nodeUuid.v4();
                }
                if (doc.trashSetIds) {
                    var parseQueryItems = function (item) {
                        queryIds.push(item);
                    };
                    for (i = 0; i < doc.trashSetIds.length; i += 1) {
                        tId = doc.trashSetIds[i];
                        if (tId.indexOf(':') > 0) {
                            tokens = tId.split(':');
                            modelName = tokens[0];
                            prop = tokens[1];
                            model = db.readWriteConnection.model(modelName);
                            query = {};
                            query[prop] = doc._id;
                            promises.push(model.update(query, {inTheTrash: true}, {multi: true}));
                        }
                        if (tId.indexOf('|') > 0) {
                            tokens = tId.split('|');
                            prop = tokens[0];
                            modelName = tokens[1];
                            model = db.readWriteConnection.model(modelName);
                            query = {};
                            direction = tokens[2] || 'mine';

                            if (direction === 'mine') {
                                if (Array.isArray(doc.get(prop))) {
                                    var itemArray = doc.get(prop),
                                        queryIds = [];
                                    itemArray.forEach(parseQueryItems);
                                    query = {_id: {$in: queryIds}};
                                    promises.push(model.update(query, {inTheTrash: true}, {multi: true}));
                                } else {
                                    if (doc.get(prop)._id) {
                                        query = {_id: doc.get(prop)._id};
                                    } else {
                                        query = {_id: doc.get(prop)};
                                    }
                                    promises.push(model.update(query, {inTheTrash: true}, {multi: true}));
                                }
                            } else {
                                query[prop] = doc._id;
                                promises.push(model.update(query, {inTheTrash: true}, {multi: true}));
                            }
                        }
                    }
                }
            } else {
                doc.set('trashedOnDate', undefined);
                if (doc.name) {
                    doc.name = doc.originalName;
                }
                if (doc.rootTrashedItem){
                    doc.rootTrashedItem = false;
                }
                query = {};
                if (doc.trashSetIds) {
                    for (i = 0; i < doc.trashSetIds.length; i += 1) {
                        tId = doc.trashSetIds[i];
                        if (tId.indexOf(':') > 0) {
                            tokens = tId.split(':');
                            modelName = tokens[0];
                            prop = tokens[1];
                            model = db.readWriteConnection.model(modelName);
                            query = {};
                            query[prop] = doc._id;
                            promises.push(model.update(query, {inTheTrash: false}, {multi: true}));
                        }
                        if (tId.indexOf('|') > 0) {
                            tokens = tId.split('|');
                            prop = tokens[0];
                            modelName = tokens[1];
                            direction = tokens[2] || 'mine';

                            model = db.readWriteConnection.model(modelName);
                            query = {};
                            if (direction === 'mine') {
                                if (Array.isArray(doc.get(prop))) {
                                    query = {_id: {$in: [doc.get(prop)]}};
                                    promises.push(model.update(query, {inTheTrash: false}, {multi: true}));
                                } else {
                                    query = {_id: doc.get(prop)};
                                    promises.push(model.update(query, {inTheTrash: false}, {multi: true}));
                                }
                            } else {
                                query[prop] = doc._id;
                                promises.push(model.update(query, {inTheTrash: false}, {multi: true}));
                            }
                        }
                    }
                }
            }
        }
        if (promises.length > 0) {
            Q.all(promises).then(function () {
                next();
            }).catch(function (err) {
                next(err);
            }).done();
        } else {
            next();
        }
    });
};

