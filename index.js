const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

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

app.use(express.json())
app.use(requestLogger)


let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
  ]

app.get('/',(request,response) => {
    response.send('<h1>Hello world!</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

app.get('/api/notes/:id',(request,response)=> {
  const id = Number(request.params.id);
  const note = notes.find(n => n.id === id);
    
  if(note){
    response.json(note);
  }
  else{
    response.status(404).end();
  }
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n=> n.id))
    : 0
  return maxId + 1
}

app.post('/api/notes', (request,response) => {
  
  const body = request.body
  if(!body.content){
    return response.status(404).json({
      error: 'content missing'
    })
  }
  const note = {
    content:  body.content,
    important: Boolean(body.important) || false,
    id: generateId(),
  }
  notes = notes.concat(note);
  response.json(note);
})

app.delete('/api/notes/:id',(request,response)=> {
  const id = Number(request.params.id);
  notes =  notes.filter(note => note.id !== id);

  response.status(204).end();
})

app.use(unkownEndpoint)

const PORT = 3001;
app.listen(PORT, ()=> {
    console.log(`server running on port: ${PORT}`);
});