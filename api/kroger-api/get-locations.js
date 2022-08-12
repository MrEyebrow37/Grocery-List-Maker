const krogerConfig = require("../../config/kroger-config")
const axios = require('axios').default

const getLocations = ({zipCode,authToken,radiusInMiles,limit,chain}) => {
    
    const config = {
        "url": `${krogerConfig.baseProductionUrl}/locations?filter.zipCode.near=${zipCode}&filter.${radiusInMiles}=20&filter.limit=${limit}&filter.chain=${chain}`,
        "method": "GET",
        "crossDomain": true,
        "headers": {
            "Accept": "application/json",
            "Authorization": authToken,
        },
    }
    
    const response = axios(config)
    return response
    .then(res => res.data)
    .catch(e => e.response.data.errors)
}

module.exports = getLocations