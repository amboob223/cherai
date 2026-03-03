const {Pool} = require("pg");

const pool = new Pool({
    connectionString:process.env.DATABASE_URL

});

pool.connect()
            .then(()=>console.log("connected to postgres"))
            .catch(err =>console.error("db connection errorr",err))

module.exports = pool;