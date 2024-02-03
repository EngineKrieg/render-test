require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Note = require('./models/note')

const app = express()
app.use(cors())
const requestLogger = (request,response,next) => {
  console.log("Method: ",request.method)
  console.log("Path: ",request.path)
  console.log("Body: ",request.body)
  console.log("-----")
  next()
}

const unkownEndpoint = (request,response) => {
  response.status(404).send({error: "Unkown endpoint"})
}

morgan("tiny")
app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

app.get('/',(request,response) => {
    response.send('<h1>Hello world!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id',(request,response,next)=> {
  Note.findById(request.params.id)
    .then(note => {
      if(note){
        response.json(note)
      }
      else{
        response.status(404).end()
      }
  })
    .catch(error => next(error))
})

app.post('/api/notes', (request,response,next) => {

  const body = request.body
  if(body.content === "undefined"){
    return response.status(400).json({error: "content is missing"})
  }

  if(!body.content){
    return response.status(404).json({
      error: 'content missing'
    })
  }
  const note = new Note({
    content:  body.content,
    important: body.important || false
  })
  note.save().then(savedNotes => {
    response.json(savedNotes)
  })
  .catch(error=>next(error))
})

app.put('api/notes/:id'), (request,response,next) => {
  const {content, important} = request.body
  Note.findByIdAndUpdate(request.params.id, {content, important}, {new: true, runValidators: true, context:'query'})
    .then(updateNote=>{
      response.json(updateNote)
    })
    .catch(error=>next(error))
}

app.delete('/api/notes/:id',(request,response,next)=> {
  
  Note.findByIdAndDelete(request.params.id)
    .then(result=>{
      response.status(204).end()
    })
    .catch(error=> next(error))


})

app.use(unkownEndpoint)

const errorHandler = (error, request, response, next) => {

  console.log(error.message)

  if(error.name === "CastError"){
    return response.status(400).send({error: "malformatted id"})
  }
  else if(error.name === "ValidationError"){
    return response.status(400).json({error: error.message})
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT;
app.listen(PORT, ()=> {
    console.log(`server running on port: ${PORT}`);
});
