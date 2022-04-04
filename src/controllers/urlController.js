// const { base } = require('../models/urlModel');
const urlModel = require('../models/urlModel')
const shortid = require('shortid');
const { base } = require('../models/urlModel');
const validurl = require('valid-url')

//>>>>>>>>>>>>>>>>>>>>> Generate short Url <<<<<<<<<<<<<<<<<<<<<<<

const shortUrl = async function(req,res){
    try{
        const longUrl = req.body.longUrl.toLowerCase().trim();
        if(!longUrl){
            return res.status(400).send({status:false,msg:'Invalid base url'})
        }

        const urlCode = shortid.generate()

        const url = await urlModel.findOne({longUrl:longUrl})

        if(url){
          
            return res.status(400).send({status:false,msg:'longUrl already exist in the DB'})
        }
        const baseUrl = "localhost:3000"
        const shortUrl = baseUrl+'/'+urlCode
        const newUrl = {
            "longUrl":longUrl,
            "shortUrl":shortUrl,
            "urlCode":urlCode
        }

        const createUrl = await urlModel.create(newUrl)
        return res.status(201).send({status:true,data:createUrl})
    }catch(err){
      return  res.status(500).send({status:false,message:err.message})
    }
}

module.exports.newUrl = shortUrl;


const getUrl = async function(req,res){
    try{
        const shortid = req.params
        const result = await urlModel.findOne({shortid:shortid})

        if(!result){
            return res.status(404).send({status:false,msg:"ShortUrl doesn't exist"})
        }
        res.direct(result.url)


    }catch(error){
        return res.status(500).send({status:false,error:error.message});
    }
}

module.exports.getUrl = getUrl