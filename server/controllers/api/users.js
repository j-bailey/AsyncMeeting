var router = require('express').Router();
var handlers = require('./handlers/usersHandler');
var acl = require('../../security/acl').getAcl();


//router.get('/', acl.middleware, handlers.getUserFromXAuthHeader);

router.post('/', acl.middleware(), handlers.createUser);

//router.get('/', acl.middleware, handlers.quickSearchForUser);

router.get('/:id', acl.middleware(), handlers.findById);

//router.post('/', acl.middleware(), handlers.createNewMeetingArea);

router.delete('/:id', acl.middleware(), handlers.deleteById);

router.put('/:id', acl.middleware(), handlers.updateById);


module.exports = router;

