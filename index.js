//initializing the server ==>
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;


//middleware ==>
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0mxpd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//verifyJWT ==>
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ error: 'No token, authorization denied' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token is not valid' })
        }
        req.decoded = decoded
        next()
    })

}

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('cisco-chemicals-inc').collection('products');
        const reviewCollection = client.db('cisco-chemicals-inc').collection('reviews');
        const usersCollection = client.db('cisco-chemicals-inc').collection('users');
        const orderCollection = client.db('cisco-chemicals-inc').collection('orders');
        // const historyCollection = client.db('cisco-chemicals-inc').collection('history');
        // const adminCollection = client.db('cisco-chemicals-inc').collection('admin');


        //verifyAdmin =>
        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await usersCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                next()
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        }

        //Get ALL Product API ==>
        app.get('/product', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })
        //Add Product API ==>
        app.post('/product', verifyJWT, verifyAdmin, async (req, res) => {
            const product = req.body
            const inserted = await productCollection.insertOne(product)
            res.send(inserted)
        })
        //Delete specific Product API ==>
        app.delete('/product/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const deleted = await productCollection.deleteOne({ _id: ObjectId(id) })
            res.send(deleted)
        })
        //Get Individual Product  ==>
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await productCollection.findOne(query)
            res.send(service)
        })



        //Order Place API ==>
        app.post('/order', async (req, res) => {
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })
        // myOrder collection API =>
        app.get('/order', verifyJWT, async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = orderCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })
        //order delete API =>
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            res.json(result)
        })
        //get single order API =>
        app.get('/order/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const order = await orderCollection.findOne(query)
            res.send(order)
        })



        //review API ==>
        app.get('/reviews', async (req, res) => {
            const users = await reviewCollection.find().toArray();
            res.send(users);
        })

        //add a review API ==>




        
        //User API ==>
        app.get('/user', verifyJWT, async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        })
        //update User ==>
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const option = { upsert: true };
            const updateDoc = {
                $set: user,
            }
            const results = await usersCollection.updateOne(filter, updateDoc, option);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' });
            res.send({ results, token });
        })

        //Verify for admin ==>
        app.get('/admin/:email',  async (req, res) => {
            const email = req.params.email
            const user = await usersCollection.findOne({ email: email })
            const isAdmin = user.role === 'admin'
            res.send({ admin: isAdmin })
        })

        //API to Make an Admin

        app.put('/user/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            }
            const results = await usersCollection.updateOne(filter, updateDoc);
            res.send(results);
        })
    }
    finally {

    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Server is running...✔️');
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})