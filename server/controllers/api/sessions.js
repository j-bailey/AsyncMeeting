var router = require('express').Router();
var handlers = require('./handlers/sessionsHandler');

router.post('/', handlers.createTokenForUser);

module.exports = router;



