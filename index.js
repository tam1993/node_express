const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql2/promise');
const md5 = require('md5');

const saltPassword = 'thisissalttt'

const now = new Date();
const formattedDatetime = now.toISOString().slice(0, 19).replace('T', ' ');

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
        const results = await db.query('select * from users where id = ?', [uid])
        res.json(results[0])
    } catch (error) {
        res.status(500).json({ error: 'db query error' })
    }
})

app.post('/user/add', async (req, res) => {
    try {
        let data = req.body
        const password = md5(saltPassword + req.password)
        const results = await db.query('INSERT INTO `users` (`username`, `password`, `fullname`, `money_balance`, `last_deposit`, `last_withdraw`) VALUES (?, ?, \'\', 0, NULL, NULL);', [data.username, password])
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
})

app.post('/transaction/add', async (req, res) => {
    try {
        let data = req.body
        const usercheck = await db.query('select * from users where id = ?', [data.user_id])
        if (!usercheck[0].length) {
            res.status(400).json({ error: 'user not found' })
            return
        }
        const user = usercheck[0][0]
        var money_balance = parseFloat(user["money_balance"])
        if (data.transaction == 'deposit') {
            money_balance += parseFloat(data.amount)
        } else if (data.transaction == 'withdraw') {
            money_balance -= parseFloat(data.amount)
        } else {
            res.status(400).json({ error: 'wrong transaction' })
            return
        }

        if (money_balance < 0) {
            res.status(400).json({ error: 'money not enought' })
            return
        }

        const insert = await db.query('INSERT INTO `transactions` (`created_at`,`user_id`, `transaction`, `amount`, `amount_before`, `amount_after`) VALUES (?, ?, ?, ?, ?, ?);', [formattedDatetime, user["id"], data.transaction, data.amount, user["money_balance"], money_balance])
        const update = await db.query('update users set money_balance = ? where id = ?', [money_balance, user["id"]])
        res.json(update)
    } catch (error) {
        res.status(500).json({ error: 'db query error' })
    }
})

app.listen(PORT, async (req, res) => {
    await initDB()
    console.log('running port' + PORT)
})