module.exports = exports = function creationInfo(schema) {
    schema.add({createdOn: {type: Date, default: Date.now}});
    // TODO add user reference to createInfo schema element
//    schema.add({createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}});
};

