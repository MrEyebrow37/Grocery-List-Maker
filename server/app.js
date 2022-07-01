require('dotenv').config()
const axios = require('axios').default
const express = require("express")

const app = express()

const krogerConfig = require("./config/kroger-config")
const getAccessToken = require('./api/kroger-api/get-access-token')

const accessToken = getAccessToken()
accessToken.then(token => console.log(token))

app.listen(3000)