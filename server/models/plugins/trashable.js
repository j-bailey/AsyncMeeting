"use strict";

var mongoose = require('mongoose');
var nodeUuid = require('node-uuid');
var db = require('../../db');
var Q = require('q');

/**
 * This allows a mongoose entity to be put in the trash and not be deleted.  This also supports the tree structure
 * of Meeting Areas, so it will mark on children as in our out of the trash.  This also handles other dependent items,
 * so they are managed as one unit.
 *
 * @type {{init: exports.init}}
 */
module.exports = exports = {
    /**
     *
     * @param {Object[]} dependentEntities
     * @param {string} dependentEntities[].modelName Name of the Mongoose model declared in Mongoose.model()
     * @param {string} dependentEntities[].property Name of the property in the Mongoose model
     * @param {string} dependentEntities[].direction Direction to traverse from the model to include parents or children (optional)
     * @param {string} dependentEntities[].type Identifies the way to handle other entities that make up the data unit
     * @returns {Function}
     */
    init: function (dependentEntities) {
        return function (schema) {
            schema.add({
                originalName: {type: String, required: false, default: '', select: false},
                inTheTrash: {type: Boolean, required: true, default: false, select: true},
                trashedOnDate: {type: Date, required: false, select: false},
                trashedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, select: false},
                isRootTrashedItem: {type: Boolean, required: true, default: false, select: false}
            });

            schema.pre('validate', function (next) {
                var doc = this,
                    promises = [];

                if (doc.isModified('inTheTrash')) {
                    var modelName,
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
                        if (dependentEntities) {
                            var parseQueryItems = function (item) {
                                queryIds.push(item);
                            };
                            for (i = 0; i < dependentEntities.length; i += 1) {
                                tId = dependentEntities[i];
                                if (tId.type === 'byModelId') {
                                    modelName = tId.modelName;
                                    prop = tId.property;
                                    model = db.readWriteConnection.model(modelName);
                                    query = {};
                                    query[prop] = doc._id;
                                    promises.push(model.update(query, {inTheTrash: true}, {multi: true}));
                                }
                                if (tId.type === 'traverseTree') {
                                    prop = tId.property;
                                    modelName = tId.modelName;
                                    model = db.readWriteConnection.model(modelName);
                                    query = {};
                                    direction = tId.direction || 'parents'; // children or parents

                                    if (direction === 'parents') {
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
                                    } else { // children
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
                        if (doc.rootTrashedItem) {
                            doc.rootTrashedItem = false;
                        }
                        query = {};
                        if (dependentEntities) {
                            for (i = 0; i < dependentEntities.length; i += 1) {
                                tId = dependentEntities[i];
                                if (tId.type === 'byModelId') {
                                    modelName = tId.modelName;
                                    prop = tId.property;
                                    model = db.readWriteConnection.model(modelName);
                                    query = {};
                                    query[prop] = doc._id;
                                    promises.push(model.update(query, {inTheTrash: false}, {multi: true}));
                                }
                                if (tId.type === 'traverseTree') {
                                    prop = tId.property;
                                    modelName = tId.modelName;
                                    direction = tId.direction || 'children'; // children or parents

                                    model = db.readWriteConnection.model(modelName);
                                    query = {};
                                    if (direction === 'children') {
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
    }
};


