const express = require ('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
require ('dotenv').config()





const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}









const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://bistro-server:PghRRCA24rMIm6LV@cluster0.c4vhizs.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

const menuCollection = client.db("bistroDb").collection("menu");
const reviwCollection = client.db("bistroDb").collection("reviews");
const cartCollection = client.db("bistroDb").collection("carts");
const usersCollection = client.db("bistroDb").collection("users");


// Jwt---------
app.post('/jwt', (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

  res.send({ token })
})











// user related apis---


app.get ('/users', async (req, res) =>{
  const result = await usersCollection.find().toArray();
  res.send(result)
  })


app.post ('/users', async (req, res) =>{
const user= req.body;
console.log(user)
const query = {email: user.email}
const existingUser = await usersCollection.findOne(query)
console.log ('existing user',existingUser)
if (existingUser){
  return res.send ({message: 'User already exits'})
}
const result = await usersCollection.insertOne(user);
res.send(result)
})



app.get('/menu', async (req, res) =>{
    const result = await menuCollection.find().toArray();
    res.send(result)
  })

  app.get('/reviews', async (req, res) =>{
    const result = await reviwCollection.find().toArray();
    res.send(result)
  })

// Card Cooletion-------

app.get('/carts',verifyJWT, async (req, res) =>{
  const email = req.query.email;
  if (!email){
    res.send ([]);
  }

  const decodedEmail = req.decoded.email;
  if (email !== decodedEmail) {
    return res.status(403).send({ error: true, message: 'forbidden access' })
  }


const query = {email: email};
const result = await cartCollection.find(query).toArray();
res.send(result)
  })

app.post('/carts', async (req, res) =>{
  const item = req.body;
  console.log(item)

  const result = await cartCollection.insertOne(item);
  res.send(result)
})



app.delete('/carts/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id : new ObjectId(id)};
  const result = await cartCollection.deleteOne(query);
  res.send(result);
})



// update User-----------
app.get('/users/admin/:email', verifyJWT, async (req, res) => {
  const email = req.params.email;

  if (req.decoded.email !== email) {
    res.send({ admin: false })
  }

  const query = { email: email }
  const user = await usersCollection.findOne(query);
  const result = { admin: user?.role === 'admin' }
  res.send(result);
})






app.patch('/users/admin/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: 'admin'
    },
  };

  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);

})






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);















app.get ('/', (req,res) =>{
    res.send('Boss Is Setting')
})

app.listen(port, () =>{

    console.log (`Bistro Boss Is Sitting On Port ${port}`)




})












// ACCESS_TOKEN_SECRET=4e3f5c4f2ef776c7f2ef8ffa583c502770747cd8488fa438ea283550c7f69a5cb59c16ff5ae08f1031494d71f87927d99c9d2c626eb1dc512c256c36cf827e88