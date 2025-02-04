const {Pool} = require('pg')

const pool = new Pool({
    user : 'postgres',
    host : 'localhost',
    database : 'CollageAddmissioinDatabase',
    password : 'Kingsr@08',
    port : 5432
})



module.exports = pool