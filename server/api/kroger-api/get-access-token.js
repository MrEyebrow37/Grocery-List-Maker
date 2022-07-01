const krogerConfig = require("../../config/kroger-config")
const axios = require('axios').default


const getAccessToken = () => {

    const details = {
        'scope': 'product.compact',
        'grant_type': 'client_credentials',
    }
    
    const data = Object.entries(details).map(detail => {
        const encodedKey = encodeURIComponent(detail[0])
        const encodedValue = encodeURIComponent(detail[1])
        return encodedKey + "=" + encodedValue
    })
    .join("&")
    
    const config = {
        "url": `${krogerConfig.authUri}`,
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": krogerConfig.authorization,
        },
        data: data
    }
    
    const response = axios(config)
    return response
    .then(res => res.data)
    .catch(res => console.log(res))
}

module.exports = getAccessToken