const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 4200;

const uri = "mongodb+srv://tester:1234@jokes.rxrnjla.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

async function insertJoke(joke) {
  const database = client.db('jokeDatabase')
  const collection = database.collection('jokes')
  await collection.insertOne({joke})
}

connectToMongo();

app.use(express.json())

app.get('/jokes', async(req, res) => {
  try {
    const database = client.db('jokeDatabase')
    const collection = database.collection('jokes')
    const jokes = await collection.find({}).toArray()
    res.json({jokes})
  } catch (err) {
    console.error('Error retrieving jokes:', err);
    res.status(500).json({error: 'Internal Server Error'})
  }
});

app.get('/jokes/:id', async (req, res) => {
  const {id} = req.params

  if(!id) {
    return res.status(400).json({error: 'Please provide a joke id'})
  }

  const database = client.db('jokeDatabase')
  const collection = database.collection('jokes')

  try {
    const result = await collection.findOne({_id: new ObjectId(id)})
    if (!result){
      return res.status(404).json({error: 'Joke not found'})
    }

    res.json({joke: result})
  } catch (err) {
    console.error('Error retrieving joke:', err)
    res.status(500).json({error: 'Internal Server Error'})
  }

})

app.post('/create', async(req, res) => {
  const {joke} = req.body;

  if(!joke) {
    return res.status(400).json({error: "Please provide a joke"})
  }

  await insertJoke(joke);
  res.json({message: 'Joke created successfully!'})
})

app.patch('/update/:id', async(req,res) => {
  const {id} = req.params
  const {newJoke} = req.body

  if(!newJoke) {
    return res.status(400).json({error: 'Please provide a new joke'})
  }

  const database = client.db('jokeDatabase')
  const collection = database.collection('jokes')

  try {
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { joke: newJoke } });
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({error: 'Joke not found.'})
    }
    res.json({message: 'Joke updated succesfully!'})
  } catch (err) {
    console.error('Error updating joke:', err)
    res.status(500).json({error: 'Internal Server Error'})
  }
})

app.delete('/delete/:id', async(req,res) => {
  const {id} = req.params
  const {joke} = req.body

  if(!id) {
    return res.status(404).json({error: "Please choose a joke to delete"})
  }

  const database = client.db('jokeDatabase')
  const collection = database.collection('jokes')

  try {
    const result = await collection.deleteOne({_id: new ObjectId(id)})
    if (result.deletedCount === 0) {
      return res.status(404).json({error: 'Joke not found'})
    }

    res.json({message: 'Joke Deleted successfully!'})
  } catch (err) {
    console.error('Error deleting joke:', err)
    res.status(500).json({error: 'Internal Server Error'})
  }
})


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
