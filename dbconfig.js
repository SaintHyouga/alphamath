const mysql = require('mysql2');

const dbConnect = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'database',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
});

module.exports = dbConnect;
