//initializing the server ==>
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require ('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;


//middleware ==>
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0mxpd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection= client.db('cisco-chemicals-inc').collection('products');
        const reviewCollection = client.db('cisco-chemicals-inc').collection('reviews');
        const usersCollection = client.db('cisco-chemicals-inc').collection('users');
        // const productsCollection = client.db('cisco-chemicals-inc').collection('products');
        // const historyCollection = client.db('cisco-chemicals-inc').collection('history');
        // const adminCollection = client.db('cisco-chemicals-inc').collection('admin');
        // console.log("Connected to MongoDB");

        //Product API ==>
        app.get('/product', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        //Individual Product API ==>
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await productCollection.findOne(query)
            res.send(service)
        })


        //review API ==>
        app.get('/reviews', async (req, res) => {
            const users = await reviewCollection.find().toArray();
            res.send(users);
        })

        //User API ==>
        app.get('/user', async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        })

    }
    finally {

    }
}
run().catch(console.dir);
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });



app.get('/', (req, res) => {
    res.send('Server is running...✔️');
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})