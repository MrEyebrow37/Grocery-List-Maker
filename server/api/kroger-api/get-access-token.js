const krogerConfig = require("../../config/kroger-config")
const axios = require('axios').default


const getAccessToken = () => {

    const dataParams = {
        'scope': 'product.compact',
        'grant_type': 'client_credentials',
    }
    
    const data = Object.entries(dataParams).map(param => {
        const encodedKey = encodeURIComponent(param[0])
        const encodedValue = encodeURIComponent(param[1])
        return encodedKey + "=" + encodedValue
    })
    .join("&")
    
    const config = {
        "url": `${krogerConfig.authUrl}`,
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": krogerConfig.authorization,
        },
        data: data
    }
    
    const response = axios(config)
    response
    .then(token => {
        process.env.KROGER_ACCESS_TOKEN = token.data.access_token
    })
    .catch(e => console.log(e))
}

module.exports = getAccessToken