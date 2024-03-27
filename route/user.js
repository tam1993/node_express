const express = require('express')
const router = express.Router()

const user = require('../controller/user')

router.post('/login', user.login)
router.get('/selectuser', user.selectuser)
router.get('/get/:id', user.get)
router.post('/add', user.add)
router.post('/update/:id', user.update)

module.exports = router