const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const connectDB = async() => {
    try{
        await mongoose.connect(db,{
            useNewUrlParser:true
        })
        console.log('MongoDB connected')

    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

module.exports = connectDB