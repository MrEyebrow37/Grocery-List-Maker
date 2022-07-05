require('dotenv').config()

module.exports = {
    clientId: process.env.KROGER_CLIENT_ID,
    clientSecret: process.env.KROGER_CLIENT_SECRET,
    authUrl: process.env.KROGER_AUTH_URI,
    baseProductionUrl: process.env.KROGER_BASE_PRODUCTION_URI,
    baseCertificationUrl: process.env.KROGER_BASE_CERTIFICATION_URI,
    authorization: `Basic ${Buffer.from(`${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`).toString('base64')}`,
    certClientId: process.env.clientKROGER_CERT_CLIENT_ID,
    certClientSecret: process.env.KROGER_CERT_CLIENT_SECRET,
    accessToken: process.env.KROGER_ACCESS_TOKEN,
}