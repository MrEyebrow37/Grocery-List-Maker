const krogerConfig = require("../../config/kroger-config")
const axios = require('axios').default

const getProducts = ({authToken,brand,term,locationId,productId,fulfillment,start,limit}) => {
    
    const config = {
        "url": `${krogerConfig.baseProductionUrl}/products?filter.brand=${brand}&filter.term=${term}&filter.locationId=${locationId}&filter.productId=${productId}&filter.fulfillment=${fulfillment}&filter.start=${start}&filter.limit=${limit}`,
        "method": "GET",
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

module.exports = getProducts