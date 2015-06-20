var router = require('express').Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(require('../auth'));
router.use('/api/users', require('./../controllers/api/users'));
router.use('/api/meetingareas', require('./../controllers/api/meetingAreas'));
router.use(require('./static'));
module.exports = router;
