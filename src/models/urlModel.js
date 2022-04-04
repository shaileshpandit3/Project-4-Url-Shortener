const mongoose = require('mongoose');
const urlSchema = new mongoose.Schema({

    urlCode: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    longUrl: {
        type: String,
        trim: true,
        required: [true, 'longUrl is required'],
        validate: {
            validator: function (link) {
              return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(link)
            },
            message: 'Please give a valid link',
            isAsync: false
          }

    },
    shortUrl:{
        type:String,
        unique:true,
        required: true, 
        
    }

}, { timestamps: true })
module.exports = mongoose.model('Url', urlSchema)