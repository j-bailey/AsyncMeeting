var router = require('express').Router()
var bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(require('../auth'))
router.use('/api/posts', require('./../controllers/api/posts'))
router.use('/api/sessions', require('./../controllers/api/sessions'))
router.use('/api/users', require('./../controllers/api/users'))
router.use(require('./static'))
module.exports = router
