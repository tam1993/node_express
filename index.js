const express = require('express')
const bodyparser = require('body-parser')
const jwt = require('jsonwebtoken')

const dotenv = require('dotenv')
dotenv.config()

//router
const user = require('./route/user')
const transaction = require('./route/transaction')

const app = express();
app.use(bodyparser.json())


//middleware
const logger = async (req, res, next) => {
    try {
        if (!req.headers["authorization"]) {
            return res.status(401).json({ error: 'token require' })
        }
        const token = req.headers["authorization"].replace("Bearer ", "")

        const tokenVerified = jwt.verify(token, process.env.jwtSecret)

        req.userID = tokenVerified.user_id
        next()
    } catch (err) {
        console.log(err)
        res.status(401).json({ error: 'invalid token' })
    }
}

// app.get('/test', logger, async (req, res) => {
//     //async await
//     try {
//         res.json({ "auth": "sss" })
//     } catch (error) {
//         res.status(500).json({ error: 'db query error' })
//     }
// })


app.use('/transaction', logger, transaction)
app.use('/user', user)

app.listen(8889, async (req, res) => {
    console.log('running port 8889')
})