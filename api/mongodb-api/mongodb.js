const mongoDbConfig = require('../../config/mongodb-config')
const { MongoClient, ServerApiVersion } = require('mongodb')

const uri = `${mongoDbConfig.mongoDbUrl}`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

const bulkOperate = async({database, collection, operations}) => {
    try {
        // console.log(operations)
        await client.connect()
        const coll = client.db(`${database}`).collection(`${collection}`)
        const response = await coll.bulkWrite(operations)
        console.log(response)
        return response.result
    } catch (e) {
        // console.log(e)
        return e
    } finally {
        await client.close
    }
}

const find = async({database,collection,filter}) => {
    try {
        await client.connect()
        const coll = client.db(`${database}`).collection(`${collection}`)
        const response = await coll.find(filter).toArray()
        // console.log(response)
        return response

    } catch (e) {
        return e.result
    } finally {
        await client.close
    }
}

module.exports = {bulkOperate,find}