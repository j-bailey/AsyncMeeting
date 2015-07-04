var router = require('express').Router();
var handlers = require('./handlers/usersHandler');
var acl = require('../../security/acl').getAcl();


//router.get('/', acl.middleware, handlers.getUserFromXAuthHeader);

router.post('/', acl.middleware(), handlers.createUser);

//router.get('/', acl.middleware, handlers.quickSearchForUser);

router.get('/:uuid', acl.middleware(), handlers.findByUuid);

//router.post('/', acl.middleware(), handlers.createNewMeetingArea);

router.delete('/:uuid', acl.middleware(), handlers.deleteByUuid);

router.put('/:uuid', acl.middleware(), handlers.updateByUuid);


module.exports = router;

