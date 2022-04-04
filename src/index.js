const bodyParser = require('body-parser');
const express = require('express');
const route = require('./routes/route')
const mongoose = require('mongoose');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://shailesh123:rYbeOdoWZtY9NdKU@cluster0.e1ege.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{
    useNewUrlParser:true
})
.then( () => console.log("MongoDb is connected"))
.catch( err => console.log(err))


app.use('/',route)


app.listen(process.env.PORT || 3000, function(){
    console.log('Express app runnig on port' + (process.env.PORT || 3000))
})