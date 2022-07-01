require('dotenv').config()
const axios = require('axios').default;
const express = require("express")

const app = express()

const baseProductionUri = "https://api.kroger.com/v1/"
const baseCertificationUri = "https://api-ce.kroger.com/v1/"

var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.kroger.com/v1/locations",
    "method": "GET",
    "headers": {
      "Accept": "application/json",
      "Authorization": "Bearer {{TOKEN}}"
    }
}

const config = {
    "crossDomain": true,
    "url": `${baseProductionUri}locations`,
    "method": "GET",
    "headers": {
      "Accept": "application/json",
      "Authorization": `Bearer {{${process.env.client_secret}}}`
    }
}

// const response = axios(config)
// .then(res => console.log(res))
// .catch(res => console.log(res))

var details = {
    'scope': 'product.compact',
    'grant_type': 'client_credentials',
};

var formBody = [];
for (var property in details) {
  var encodedKey = encodeURIComponent(property);
  var encodedValue = encodeURIComponent(details[property]);
  formBody.push(encodedKey + "=" + encodedValue);
}
formBody = formBody.join("&");

const config2 = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.kroger.com/v1/connect/oauth2/token",
    "method": "POST",
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${process.env.client_id}:${process.env.client_secret}`).toString('base64')}`,
    },
    data: formBody
}

const response2 = axios(config2)
.then(res => console.log(res))
.catch(res => console.log(res))

console.log(Buffer.from(`${process.env.client_id}:${process.env.client_secret}`).toString('base64'))


// console.log(`Basic {{${Buffer.from(`${process.env.client_id}:${process.env.client_secret}`).toString('base64')}}}`)


app.get("/",(req,res) => {
    res.send("hello")
})

app.listen(3000)