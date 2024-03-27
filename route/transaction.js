const express = require('express')
const router = express.Router()
const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
dotenv.config()

let db = false
const initDB = async () => {
    console.log('conecting db')
    db = await mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSERNAME,
        password: process.env.DBPASSWORD,
        database: process.env.DBNAME,
        port: process.env.DBPORT
    })
}
initDB()


const now = new Date();
const formattedDatetime = now.toISOString().slice(0, 19).replace('T', ' ');

router.post('/add', async (req, res) => {
    try {
        let data = req.body
        const usercheck = await db.query('select * from users where id = ?', [req.userID])
        if (!usercheck[0].length) {
            res.status(400).json({ error: 'user not found' })
            return
        }
        const user = usercheck[0][0]
        var money_balance = parseFloat(user["money_balance"])
        if (typeof data.amount !== 'number') {
            res.status(400).json({ error: 'wrong amount' })
            return
        }
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

module.exports = router