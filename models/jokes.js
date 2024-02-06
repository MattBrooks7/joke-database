const mongoose = require('mongoose')

const JokeSchema = new mongoose.Schema({
    joke: String,
})

modules.exports = mongoose.model('Joke', JokeSchema)