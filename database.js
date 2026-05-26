const {Pool} = require("pg");

require("dotenv").config();

const pool = new Pool({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    database:process.env.DB_NAME,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD
});

pool.connect()
    .then(() => console.log("connected to postgre database"))
    .catch((err) => console.error("there was an error connecting", err));

module.exports = pool;