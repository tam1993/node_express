const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

let db = null;

const initDB = async () => {
    // console.log('connecting db');
    try {
        db = await mysql.createConnection({
            host: process.env.DBHOST,
            user: process.env.DBUSERNAME,
            password: process.env.DBPASSWORD,
            database: process.env.DBNAME,
            port: process.env.DBPORT
        });
        // console.log('db connected');
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
};

initDB();

module.exports = {
    getDB: () => db
};