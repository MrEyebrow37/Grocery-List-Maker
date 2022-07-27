require('dotenv').config()

module.exports = {
    mongoDbPassword: process.env.MONGO_DB_PASSWORD,
    mongoDbUsername:process.env.MONGO_DB_USERNAME,
    mongoDbUrl:process.env.MONGO_DB_URL,
}