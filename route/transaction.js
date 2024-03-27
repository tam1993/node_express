const express = require('express')
const router = express.Router()

const transaction = require('../controller/transaction')

router.post('/add', transaction.add)

module.exports = router