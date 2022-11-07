const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middle ware
app.use(cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wc7jl9l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req,res,next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.satatus(401).send({message: 'unauthoriz access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.satatus(403).send({ message: 'unauthoriz access' });
        }
        req.decoded = decoded;
        next()
    })
}

 async  function run() {
     try {
         const serviceCollection = client.db('geniusCarPractices').collection('services');
         const orderCollection = client.db('geniusCarPractices').collection('orders');
          
         app.post('/jwt', async (req, res) => {
             
             const user = req.body;
             const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
         
             res.send({ token })
         })
         app.get('/services', async (req, res) => {
             const page = parseInt(req.query.pageNumber);
             const size = parseInt(req.query.perPageData);
           
             const query = {};
             const cursor = serviceCollection.find(query);
             const services = await cursor.skip(page*size).limit(size).toArray();
             const count = await serviceCollection.estimatedDocumentCount();
             res.send({count, services })
         })

         app.get('/services/:id', async (req, res) => {
             const id = req.params.id;
             const query = { _id: ObjectId(id) };
             const service = await serviceCollection.findOne(query)
             res.send(service)
             
         })

         //order api

         app.delete('/orders/:id', async (req, res) => {
             const id = req.params.id;
             const query = { _id: ObjectId(id) };
             const result = await orderCollection.deleteOne(query);
             res.send(result)

         })
         
       
         app.get('/orders', verifyJWT, async (req, res) => {
             const decoded = req.decoded;
             if (decoded.email !== req.query.email) {
                 res.status(403).send({ message: 'unauthoriz access'})
             }
             let query = {};
             if (req.query.email) {
                 query = {
                      email: req.query.email
                }
             }
             const cursor = orderCollection.find(query);
             const services = await cursor.toArray();
             res.send(services)
         })

         app.post('/orders', async (req, res) => {
             const query = req.body;
             const result = await orderCollection.insertOne(query)
             res.send(result)

         })

         app.patch('/orders/:id', async (req, res) => {
             const id = req.params.id;
             const status = req.body.status;
             const query = { _id: ObjectId(id) }
             const updatedDoc = {
                 $set: {
                     status: status
                 }
             }
             const result = await orderCollection.updateOne(query, updatedDoc)
             res.send(result);
         })
     }
     finally {
         
     }
}
run().catch(err => console.error(err))



app.get('/', (req, res) => {
    res.send('Genius server is running...');
})

app.listen(port, () => {
    console.log(`Genius Car server running on ${port}`)
})
