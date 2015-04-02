var router = require('express').Router();
var handlers = require('./handlers/usersHandler');

router.get('/', handlers.getUserFromXAuthHeader);

router.post('/', handlers.createUser);

module.exports = router;

