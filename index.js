const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// middleware YeHvB1dqyqdJiNJa  smartDBUSerModule55

const uri = "mongodb+srv://smartDBUSerModule55:YeHvB1dqyqdJiNJa@myfirstmongodbmodule54.k6sau1y.mongodb.net/?appName=Myfirstmongodbmodule54";




app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


app.get('/', (req, res) => {
    res.send("Server Is Running")
})

async function run() {
    try {
        await client.connect();

        const db = client.db('smart-db')
        const productCollection = db.collection("products")

        app.get('/products', async (req, res) => {
            const cursor = productCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query)
            res.send(result)
        })

        app.post('/products', async (req, res) => {
            const newProduct = req.body
            const result = await productCollection.insertOne(newProduct)
            res.send(result)
        })

        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id;
            const productBody = req.body;
            const query = { _id: new ObjectId(id) }
            const updatedDocuments = {
                $set: {
                    name: productBody.name,
                    price: productBody.price
                }
            }
            const result = await productCollection.updateOne(query, updatedDocuments)
            res.send(result)

        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    finally {

    }
}


run().catch(console.dir)


app.listen(port, () => {
    console.log(`smart server is working on port:${port}`)
})