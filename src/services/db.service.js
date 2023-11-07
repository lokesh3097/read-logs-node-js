const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const poolConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 100,
    dateStrings: true,
    connectTimeout: 10000,
    queueLimit: 10,
    multipleStatements: true
};

async function query(sql, params) {
  const pool = await mysql.createPool(poolConfig);
  const [results, fields] = await pool.execute(sql, params);
  // console.log(fields);
  return results;
}

module.exports = {
  query
}