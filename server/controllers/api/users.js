var router = require('express').Router();
var handlers = require('./handlers/usersHandler');
var acl = require('../../security/acl').getAcl();
var secUtils = require('../../utils/securityUtils');


router.get('/invalidPassword/:password', secUtils.readOnlyDbConnection, handlers.isInvalidPassword);

router.get('/invalidUsername/:username', secUtils.readOnlyDbConnection, handlers.isInvalidUsername);

router.get('/:id', acl.middleware(), secUtils.readOnlyDbConnection, handlers.findById);

router.post('/', acl.middleware(), secUtils.determineDbConnection, handlers.createUser);

router.delete('/:id', acl.middleware(), secUtils.determineDbConnection, handlers.deleteById);

router.put('/:id', acl.middleware(), secUtils.determineDbConnection, handlers.updateById);

module.exports = router;

