const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middle ware
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wc7jl9l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

 async  function run() {
     try {
         const serviceCollection = client.db('geniusCarPractices').collection('services');
         const orderCollection = client.db('geniusCarPractices').collection('orders');

         app.get('/services', async (req, res) => {
             const page = parseInt(req.query.pageNumber);
             const size = parseInt(req.query.perPageData);
             console.log(page,size)
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

         //otder api

         app.delete('/orders/:id', async (req, res) => {
             const id = req.params.id;
             const query = { _id: ObjectId(id) };
             const result = await orderCollection.deleteOne(query);
             res.send(result)

         })
         
       
         app.get('/orders', async (req, res) => {
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
