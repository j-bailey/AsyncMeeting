var router = require('express').Router();
var handlers = require('./handlers/usersHandler');
var acl = require('../../security/acl').getAcl();
var secUtils = require('../../security/securityUtils');

//router.get('/', acl.middleware, handlers.getUserFromXAuthHeader);

router.post('/', acl.middleware(), secUtils.determineDbConnection, handlers.createUser);

//router.get('/', acl.middleware, handlers.quickSearchForUser);

router.get('/:id', acl.middleware(), secUtils.readOnlyDbConnection, handlers.findById);

//router.post('/', acl.middleware(), handlers.createNewMeetingArea);

router.delete('/:id', acl.middleware(), secUtils.determineDbConnection, handlers.deleteById);

router.put('/:id', acl.middleware(), secUtils.determineDbConnection, handlers.updateById);

module.exports = router;

