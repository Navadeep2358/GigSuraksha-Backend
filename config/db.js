const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
});

db.connect(err => {
  if(err){
    console.log("DB connection failed");
  } else {
    console.log("MySQL Connected");
  }
});

module.exports = db;