require('dotenv').config()
const axios = require('axios').default
const express = require("express")
const path = require('path')
const CronJob = require('cron').CronJob
const cors = require('cors')
const bodyParser = require('body-parser')
const convert = require('convert-units')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Kroger API ///////////////////////////////////////////////////////////////////////////

const krogerConfig = require('./config/kroger-config')
const getAccessToken = require('./api/kroger-api/get-access-token')
const getLocations = require('./api/kroger-api/get-locations')
const getProducts = require('./api/kroger-api/get-products')

// MongoDB API ///////////////////////////////////////////////////////////////////////////

const {bulkOperate,find} = require('./api/mongodb-api/mongodb')

///////////////////////////////////////////////////////////////////////////

const getNewAccessToken = new CronJob({
    cronTime: '1 0,20,40 * * * *',
    onTick: () => {
        getAccessToken()
    },
    runOnInit: true
}).start()

// Routes /////////////////////////////////////////////////////////////////////////

app.post("/api/locations",async(req,res) => {
    const locations = await getLocations({
        authToken: `Bearer ${krogerConfig.krogerAccessToken}`,
        ...req.body,
    })
    res.send(locations)
})

app.post("/api/products", async(req,res) => {
    const products = await getProducts({
        authToken: `Bearer ${krogerConfig.krogerAccessToken}`,
        ...req.body,
    })
    console.log(products)
    products.data.forEach(product => {
        const sizes = product.items[0].size.split(` / `).flatMap(size => {
            if (!product.items[0].price) {
                return {
                    originalQuantity: `1`,
                    originalSize: `oz`,
                    originalPrice: 0,
                }
            } else if (size.split(` `)[1] === `fl`) {
                return {
                    originalQuantity: size.split(` `)[0],
                    originalSize: `fl-oz`,
                    originalPrice: 0,
                }
            } else if (size.split(` `)[1] === `pt` || size.split(` `)[1] === `pint`) {
                return {
                    originalQuantity: size.split(` `)[0],
                    originalSize: `pnt`,
                    originalPrice: 0,
                }
            } else {
                return {
                    originalQuantity: size.split(` `)[0],
                    originalSize: size.split(` `)[1],
                    originalPrice: product.items[0].price.regular,
                }
            }
        })

        const newSizes = sizes.map(size => {
            if (size.originalSize && size.originalSize !== (`ct`) && size.originalSize !== (`12pk`) && size.originalSize !== (`bottles`) && size.originalSize !== (`pouches`)) {
                possibleSizes = convert().from(size.originalSize).possibilities()
                const newPossibleSizes = possibleSizes.map(possible => {
                    const conversionFraction = convert(1).from(size.originalSize).to(possible)
                    return {...size,
                        size: possible,
                        conversionFraction: conversionFraction,
                        price: size.originalPrice*conversionFraction,
                        pricePerOriginalSize: size.originalQuantity/size.originalPrice,
                    }
                })
                return newPossibleSizes
            }
        })
        product.sizes = newSizes
    })
    console.log(products.data[0].sizes)
    res.send(products)
})

app.post("/api/recipes",async(req,res) => {
    const config = {
        database: `grocery-list-maker`,
        collection: `recipes`,
        operations: [req.body],
    }
    const response = await bulkOperate(config)
    res.send(response)
})

app.post("/api/getRecipes",async(req,res) => {
    const config = {
        database: `grocery-list-maker`,
        collection: `recipes`,
        filter: req.body,
    }
    const response = await find(config)
    res.send(response)
})

app.post("/api/register",async(req,res) => {
    console.log("register")
    const config = {
        database: `grocery-list-maker`,
        collection: `users`,
        filter: req.body.filter,
        operations: [req.body.operations],
    }
    const exists = await find(config)
    if (exists[0]) {
        res.send({response: "This username already exists. Please choose a different one."})
    } else {
        const response = await bulkOperate(config)
        res.send(response)
    }
})

app.post("/api/login",async(req,res) => {
    console.log("login")
    const config = {
        database: `grocery-list-maker`,
        collection: `users`,
        filter: req.body.filter,
        operations: [req.body.operations],
    }
    const exists = await find(config)
    if (exists[0] && req.body.params.password === exists[0].password) {
        res.send({response: "Success!",krogerLocation: exists[0].krogerLocation})
    } else if (exists[0] && req.body.params.password !== exists[0].password) {
        res.send({response: "Sorry, the username and password didn't match. Please try again."})
    } else {
        res.send({response: "Sorry, the username you entered doesn't exist. Please try again."})
    }
})

app.post("/api/setZipCode",async(req,res) => {
    console.log(req.body)
    const config = {
        database: `grocery-list-maker`,
        collection: `users`,
        operations: [req.body.operations],
    }
    await bulkOperate(config).then(response => res.send(response))
    .catch(response => console.log(response))
})

if (process.env.NODE_ENV === `production`) {
    app.use(express.static(path.join(__dirname,`/client/build`)))

    app.get('/',(req,res) => {
        res.sendFile(path.join(__dirname,`client`,`build`,`index.html`))
    })
}

app.listen(process.env.PORT)