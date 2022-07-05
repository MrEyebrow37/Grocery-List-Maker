require('dotenv').config()
const axios = require('axios').default
const express = require("express")
const CronJob = require('cron').CronJob
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const getAccessToken = require('./api/kroger-api/get-access-token')
const getLocations = require('./api/kroger-api/get-locations')
const getProducts = require('./api/kroger-api/get-products')

const getNewAccessToken = new CronJob({
    cronTime: '1 0,20,40 * * * *',
    onTick: () => {
        getAccessToken()
    },
    runOnInit: true
}).start()

app.post("/locations",async(req,res) => {
    const locations = await getLocations({
        authToken: `Bearer ${process.env.KROGER_ACCESS_TOKEN}`,
        ...req.body,
    })
    res.send({...locations})
})

app.post("/products", async(req,res) => {
    const products = await getProducts({
        authToken: `Bearer ${process.env.KROGER_ACCESS_TOKEN}`,
        ...req.body,
    })
    console.log(products)
    res.send({...products})
})

app.listen(4040)