require('dotenv').config()
const axios = require('axios').default
const express = require("express")
const path = require('path')
const CronJob = require('cron').CronJob
const cors = require('cors')
const bodyParser = require('body-parser')
const convert = require('convert-units')
const PDFDocument = require('pdfkit')
const bcrypt = require('bcrypt')
const saltRounds = 10

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
    products.data.forEach(product => {
        const sizes = product.items[0].size.split(` / `).flatMap(size => {
            const sizeArray = size.split(` `)
            let originalQuantity = Number(size.split(` `)[0])
            if (sizeArray[0].includes(`/`)) {
                const numberArray = sizeArray[0].split(`/`)
                originalQuantity = parseInt(numberArray[0],10) / parseInt(numberArray[1],10)
            }
            if (!product.items[0].price) {
                return {
                    originalQuantity: 1,
                    originalSize: `oz`,
                    originalPrice: 0,
                }
            } else if (sizeArray[1] === `fl`) {
                return {
                    originalQuantity: originalQuantity,
                    originalSize: `fl-oz`,
                    originalPrice: product.items[0].price.regular,
                }
            } else if (sizeArray[1] === `pt` || sizeArray[1] === `pint`) {
                return {
                    originalQuantity: originalQuantity,
                    originalSize: `pnt`,
                    originalPrice: product.items[0].price.regular,
                }
            } else {
                return {
                    originalQuantity: originalQuantity,
                    originalSize: sizeArray[1],
                    originalPrice: product.items[0].price.regular,
                }
            }
        })

        const newSizes = sizes.flatMap(size => {
            if (size.originalSize && size.originalSize !== (`ct`) && size.originalSize !== (`12pk`) && size.originalSize !== (`bottles`) && size.originalSize !== (`pouches`) && size.originalSize !== (`pk`)) {
                possibleSizes = convert().from(size.originalSize).possibilities()
                const newPossibleSizes = possibleSizes.map(possible => {
                    const conversionFraction = convert(1).from(size.originalSize).to(possible)
                    return {...size,
                        size: possible,
                        conversionFraction: Number(conversionFraction),
                        pricePerThisSize: Number((size.originalPrice/conversionFraction/size.originalQuantity)),
                        pricePerOriginalSize: Number((size.originalPrice/size.originalQuantity)),
                    }
                })
                return newPossibleSizes
            } 
            // else if (size.originalSize !== (`12pk`)) {
            //     return {...size,
            //         size: size.originalSize,
            //         conversionFraction: Number((1/size.originalQuantity).toFixed(2)),
            //         pricePerThisSize: Number((size.originalPrice/(1/size.originalQuantity)/size.originalQuantity).toFixed(2)),
            //         pricePerOriginalSize: Number((size.originalPrice/size.originalQuantity).toFixed(2)),
            //     }
            // }
        })
        product.sizes = newSizes
    })
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
        filter: req.body.filter,
    }
    let productsString = ``
    let index = 0
    const recipeResponse = await find(config)
    recipeResponse.forEach((id) => {
        Object.keys(id.products).forEach((id) => {
            if (index === 0) {
                index = 1
                productsString = id
            } else {
                productsString = productsString + `,` + id
            }
        })
    })
    req.body.params.productId = `${productsString}`
    const products = await getProducts({
        authToken: `Bearer ${krogerConfig.krogerAccessToken}`,
        ...req.body.params,
    })

    recipeResponse.forEach(recipe => {
        recipe.update = false
        Object.entries(recipe.products).forEach(product => {
            const krogerInfo = products.data.find(krogerProduct => krogerProduct.productId === product[0])
            product[1].krogerInfo = krogerInfo
        })
    })
    res.send(recipeResponse)
})

app.post("/api/updateRecipes",async(req,res) => {
    // console.log(req.body)
    const config = {
        database: `grocery-list-maker`,
        collection: `recipes`,
        operations: req.body.map(recipe => {
            return {
                updateOne: {
                    filter: {title: `${recipe.title}`},
                    update: {$set: {title: recipe.title, products: recipe.products, recipe: recipe.servings}},
                }
            }
        })
    }
    const response = await bulkOperate(config)
    res.send(response)
})

app.delete("/api/deleteRecipe",async(req,res) => {
    // console.log(req.body)
    const config = {
        database: `grocery-list-maker`,
        collection: `recipes`,
        operations: [{deleteOne: {
            filter: {title: `${req.body.title}`}
        }}]
    }
    const response = await bulkOperate(config)
    res.send(response)
})

app.post("/api/register",async(req,res) => {

    const username = req.body.username
    const plaintextPassword = req.body.password

    const filter = {
        username,
    }

    let config  = {
        database: `grocery-list-maker`,
        collection: `users`,
        filter,
    }

    const exists = await find(config)
    if (exists[0]) {
        res.send({response: "This username already exists. Please choose a different one."})
    } else {
        await bcrypt.hash(plaintextPassword, saltRounds, async function(err, hash) {
            const operations = [{
                insertOne: {
                    document: {...req.body.params, password: hash}
                }
            }]

            config = {
                database: `grocery-list-maker`,
                collection: `users`,
                filter,
                operations,
            }

            const response = await bulkOperate(config)
            res.send(response)
        })
    }
})

app.post("/api/login",async(req,res) => {

    const plaintextPassword = req.body.password
    const username = req.body.username

    const filter = {
        username,
    }

    let config = {
        database: `grocery-list-maker`,
        collection: `users`,
        filter,
    }

    const exists = await find(config)
    if (exists[0]) {
        await bcrypt.compare(plaintextPassword, exists[0].password, async function(err, result) {
            if (result) {
                res.send({response: "Success!",krogerLocation: exists[0].krogerLocation, username,})
            } else if (!result) {
                res.send({response: "Sorry, the username and password didn't match. Please try again."})
            }
        })
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

app.post("/api/getPdf",async(req,res) => {
    const list = req.body.recipes.flatMap(recipe => {
        return Object.values(recipe.products).map(product => {
            return {...product,title: recipe.title,}
        })
    })
    const doc = new PDFDocument
    doc.pipe(res)
    list.forEach(product => {
        doc.fontSize(10).text(`${product.krogerInfo.aisleLocations[0].description}`,{continued: true}).fontSize(8).text(`-${product.title}`)
    })
    doc.end()
})

if (process.env.NODE_ENV === `production`) {
    app.use(express.static(path.join(__dirname,`/client/build`)))

    app.get('/*',(req,res) => {
        res.sendFile(path.join(__dirname,`client`,`build`,`index.html`))
    })
}

app.listen(process.env.PORT)