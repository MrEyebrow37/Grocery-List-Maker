require('dotenv').config()

module.exports = {
    clientId: process.env.KROGER_CLIENT_ID,
    clientSecret: process.env.KROGER_CLIENT_SECRET,
    authUri: process.env.KROGER_AUTH_URI,
    baseProductionUri: process.env.KROGER_BASE_PRODUCTION_URI,
    baseCertificationUri: process.env.KROGER_BASE_CERTIFICATION_URI,
    authorization: `Basic ${Buffer.from(`${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`).toString('base64')}`
}