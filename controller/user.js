const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
dotenv.config()

const md5 = require('md5')
const jwt = require('jsonwebtoken')

let db = false
const initDB = async () => {
    db = await mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSERNAME,
        password: process.env.DBPASSWORD,
        database: process.env.DBNAME,
        port: process.env.DBPORT
    })
}
initDB()

exports.login = async (req, res) => {
    try {
        const data = req.body
        const password = md5(process.env.saltPassword + data.password)
        const regex = /^[a-z0-9]+$/;
        if (!regex.test(data.username)) {
            res.status(400).json({ error: 'username require a-z 0-9' })
            return
        }

        const results = await db.query('select * from users where `username` = ? and `password` = ?', [data.username, password])
        if (!results[0].length) {
            res.status(400).json({ error: 'user or password incorrect' })
            return
        }
        //jwt
        const jwtData = {
            user_id: results[0][0]["id"]
        }
        const gentoken = jwt.sign(jwtData, process.env.jwtSecret, { expiresIn: "30m", algorithm: "HS256" })
        res.json({ token: gentoken })
    } catch (error) {
        res.status(500).json({ error: 'db query error' })
    }
}

exports.selectuser = async (req, res) => {
    //async await
    try {
        const results = await db.query('select * from users')
        res.json(results[0])
    } catch (error) {
        res.status(500).json({ error: 'db query error' })
    }
}

exports.get = async (req, res) => {
    //async await
    try {
        uid = req.params.id
        const results = await db.query('select * from users where id = ?', [uid])
        res.json(results[0])
    } catch (error) {
        res.status(500).json({ error: 'db query error' })
    }
}

exports.add = async (req, res) => {
    try {
        let data = req.body
        const password = md5(process.env.saltPassword + data.password)
        const regex = /^[a-z0-9]+$/;
        if (!regex.test(data.username)) {
            res.status(400).json({ error: 'username require a-z 0-9' })
            return
        }
        const results = await db.query('INSERT INTO `users` (`username`, `password`, `fullname`, `money_balance`, `last_deposit`, `last_withdraw`) VALUES (?, ?, \'\', 0, NULL, NULL);', [data.username, password])
        res.json(results[0]);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'db insert error' })
    }
}

exports.update = async (req, res) => {
    try {
        uid = req.params.id
        let data = req.body
        const results = await db.query('select * from users where id = ?', [uid])
        if (!results[0].length) {
            res.status(400).json({ error: 'user not found' })
            return
        }
        const update = await db.query('update users set fullname = ? where id = ?', [data.fullname, uid])
        res.json(update)
    } catch (error) {
        res.status(500).json({ error: 'db query error' })
    }
}