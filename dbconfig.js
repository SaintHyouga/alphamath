const mysql = require('mysql2');

const dbConnect = mysql.createConnection({
  host:'localhost',
  user:'wittayas_wittaya',
  database:'wittayas_jp',
  password:"Hyouga123456"
});

module.exports = dbConnect;
