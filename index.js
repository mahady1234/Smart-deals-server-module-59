const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// middleware YeHvB1dqyqdJiNJa  smartDBUSerModule55


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@myfirstmongodbmodule54.k6sau1y.mongodb.net/?appName=Myfirstmongodbmodule54`;




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
        const bidCollection = db.collection('bid')
        const userCollection = db.collection("users")


        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email
            const query = { email: email }
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                res.send("User already logged in")
            }
            else {
                const result = await userCollection.insertOne(newUser)
                res.send(result)
            }
        })

        app.get('/products', async (req, res) => {
            // const projectFields={title:1,price_min:1,_id:0,email:1}
            // const cursor = productCollection.find().sort({price_min:-1}).limit(8).skip(2).project(projectFields)
            console.log(req.query)
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email;
            }


            const cursor = productCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })


        // bid collection

        app.get('/bid', async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.buyer_email = email
            }
            const cursor = bidCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get("/latestProducts", async (req, res) => {
            const cursor = productCollection.find().sort({ price_max: -1 }).limit(5)
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

        app.delete('/bid/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bidCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/product/bid/:productId', async (req, res) => {
            const productId = req.params.productId
            const query = { product: productId }
            const cursor = bidCollection.find(query).sort({ bid_price: -1 })
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/bid', async (req, res) => {
            const query = {}
            if (req.query.email) {
                query.buyer_email = req.query.email
            }
            const cursor = bidCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/bid', async (req, res) => {
            const newBid = req.body;
            const result = await bidCollection.insertOne(newBid)
            res.send(result)
        })

        app.delete('/bid/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bidCollection.deleteOne(query)
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