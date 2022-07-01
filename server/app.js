require('dotenv').config()
const axios = require('axios').default
const express = require("express")

const app = express()

const krogerConfig = require("./config/kroger-config")
const getAccessToken = require('./api/kroger-api/get-access-token')

const accessTokenPromise = getAccessToken()
accessTokenPromise
.then(token => console.log(token))
.catch(e => console.log(e))

app.listen(4040)