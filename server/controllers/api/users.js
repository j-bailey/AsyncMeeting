var router = require('express').Router();
var handlers = require('./handlers/usersHandler');

router.get('/', handlers.getUserFromXAuthHeader);

router.post('/', handlers.createUser);

router.get('/', handlers.quickSearchForUser);

module.exports = router;

