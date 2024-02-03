const mongoose = require("mongoose")
mongoose.set('strictQuery',false)
const URL = process.env.MONGODB_URI
console.log('connecting to mongoDB', URL)

mongoose.connect(URL)
    .then(result=>{
        console.log("connected to mongoDB")
    })
    .catch(error=>{
        console.log("error connectin to mongodb", error.message)
    })
const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        minLength: 5,
        required: true
    },
    important: Boolean
})



noteSchema.set('toJSON',{
    transform: (doc,returnObj) => {
        returnObj.id = returnObj._id.toString()
        delete returnObj._id
        delete returnObj.__v
    }
})
module.exports = mongoose.model("Note",noteSchema)