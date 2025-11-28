const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000


// const admin = require("firebase-admin")
// const serviceAccount = require("./module-55-smart-deals-website-firebase-adminsdk-fbsvc-290edc7bf0.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

const admin = require("firebase-admin");
const serviceAccount = require("./module-55-smart-deals-website-firebase-admin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


// middleware YeHvB1dqyqdJiNJa  smartDBUSerModule55


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@myfirstmongodbmodule54.k6sau1y.mongodb.net/?appName=Myfirstmongodbmodule54`;




app.use(cors())
app.use(express.json())

const verifyFirebaseToken = async (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(401).send({ message: "unauthorized access" })
    }
    const token = authorization.split(' ')[1]
    if (!token) {
        return res.status(401).send({ message: "unauthorized access" })
    }
    try {
        const decoded = await admin.auth().verifyIdToken(token)
        console.log("inside token", decoded)
        req.token_email = decoded.email
        next()
    }
    catch (error) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
}

// const logger = (req, res, next) => {
//     console.log("middle wire making done successfully")
//     next()
// }

// const verifyJWTToken = (req, res, next) => {
//     const authorization = req.headers.authorization;
//     if (!authorization) {
//         return res.status(401).send({ message: 'unauthorized access' })
//     }

//     const token = authorization.split(' ')[1]
//     if (!token) {
//         return res.status(401).send({ message: 'unauthorized access' })
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
//         if (err) {
//             return res.status(401).send({ message: 'unauthorized access' })
//         }
//         console.log(decode)
//         req.token_email = decode.email
//         next()
//     })

// }

// const handleFirebaseToken = async (req, res, next) => {
//     console.log('token', req.headers.authorization)
//     if (!req.headers.authorization) {
//         return res.status(401).send({ message: "unauthorized access" })
//     }
//     const token = req.headers.authorization.split(' ')[1]
//     if (!token) {
//         return res.status(401).send({ message: "unauthorized access" })
//     }

//     try {
//         const result = await admin.auth().verifyIdToken(token)
//         req.token_email = result.email;
//         next()
//     }
//     catch {
//         return res.status(401).send({ message: "unauthorized access" })
//     }

// }

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


        // jwt token getting

        app.post('/getToken', (req, res) => {
            const loggedUser = req.body;
            const token = jwt.sign({ loggedUser }, process.env.JWT_SECRET, { expiresIn: "1h" })
            res.send({ token: token })
        })


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

        app.get('/bid', verifyFirebaseToken, async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.buyer_email = email
                if (email !== req.token_email) {
                    return res.status(403).send({ message: 'forbidden access' })
                }
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

        app.post('/products', verifyFirebaseToken, async (req, res) => {
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

        app.get('/product/bid/:productId', handleFirebaseToken, async (req, res) => {
            const productId = req.params.productId
            const query = { product: productId }
            const cursor = bidCollection.find(query).sort({ bid_price: -1 })
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/bid', async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.buyer_email = email;
            }

            if (email !== req.token_email) {
                return res.status(401).send({ message: 'unable to access' })
            }
            const cursor = bidCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })


        // app.get('/bid', logger, handleFirebaseToken, async (req, res) => {
        //     console.log(req.token_email)
        //     const email = req.query.email
        //     const query = {}
        //     if (email) {
        //         if (email !== req.token_email) {
        //             return res.status(403).send({ message: "unauthorized access" })
        //         }
        //         query.buyer_email = email
        //     }
        //     const cursor = bidCollection.find(query)
        //     const result = await cursor.toArray()
        //     res.send(result)
        // })

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