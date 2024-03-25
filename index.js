const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql2/promise');
const md5 = require('md5');

const saltPassword = 'thisissalttt'

const DBNAME = 'node'
const DBUSERNAME = 'root'
const DBPASSWORD = '1234'
const DBHOST = 'localhost'
const DBPORT = 3306

const PORT = process.env.PORT || 8889;
const app = express();
app.use(bodyparser.json())

let db = false
const initDB = async () => {
    console.log('conecting db')
    db = await mysql.createConnection({
        host: DBHOST,
        user: DBUSERNAME,
        password: DBPASSWORD,
        database: DBNAME,
        port: DBPORT
    })
}
// //middleware
// const logger = (req, res, next) => {
//     console.log('ok')
//     next()
// }
// app.use(logger)

app.get('/user/selectuser', async (req, res) => {
    //async await
    try {
        const results = await db.query('select * from users')
        res.json(results[0])
    } catch (error) {
        res.status(500).json({ error: 'db query error' })
    }
})

app.get('/user/get/:id', async (req, res) => {
    //async await
    try {
        uid = req.params.id
        const results = await db.query('select * from users where id = ' + uid)
        res.json(results[0])
    } catch (error) {
        res.status(500).json({ error: 'db query error' })
    }
})

app.post('/user/add', async (req, res) => {
    try {
        let data = req.body
        const password = md5(saltPassword + req.password)
        const results = await db.query('INSERT INTO `users` (`username`, `password`, `fullname`, `money_balance`, `last_deposit`, `last_withdraw`) VALUES (\'' + data.username + '\', \'' + password + '\', \'\', 0, NULL, NULL);')
        res.json(results[0]);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'db insert error' })
    }
})

app.post('/user/update/:id', async (req, res) => {
    try {
        uid = req.params.id
        let data = req.body
        const results = await db.query('select * from users where id = ' + uid)
        if (!results[0].length) {
            res.status(500).json({ error: 'user not found' })
            return
        }
        const update = await db.query('update users set fullname = \'' + data.fullname + '\' where id = ' + uid)
        res.json(update)
    } catch (error) {
        res.status(500).json({ error: 'db query error' })
    }
})

app.listen(PORT, async (req, res) => {
    await initDB()
    console.log('running port' + PORT)
})