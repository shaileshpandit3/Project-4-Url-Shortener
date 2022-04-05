const urlModel = require('../models/urlModel.js')
const shortid = require('shortid');
const validator = require('../validator/validator.js')
const config = require('config')

//>>>>>>>>>>>>>>>>>>>>> Generate short Url <<<<<<<<<<<<<<<<<<<<<<<

const shortUrl = async function(req,res){
    try{
        const longUrl = req.body.longUrl.toLowerCase().trim();
        const baseUrl = config.get('baseUrl')
        
        if (!validator.longUrlPresent(longUrl)) {
            return res.status(400).send({ status: false, msg: "Please enter long Url" })
        }
        if (!validator.isValidUrl(longUrl)) {
            return res.status(400).send({ status: false, msg: ` 'Please give a valid longUrl' ` })
        }
        const urlCode = shortid.generate().toLowerCase()
        const shortUrl = baseUrl + '/' + urlCode
        let url = {
            longUrl,
            shortUrl,
            urlCode
        }
        let uniqueUrl = await UrlModel.findOne({ urlCode })
        while (uniqueUrl) {
            const urlCode = shortid.generate().toLowerCase()
            const shortUrl = baseUrl + '/' + urlCode
            url = {
                longUrl,
                shortUrl,
                urlCode
            }
        }

        const createUrl = await urlModel.create(url)
        return res.status(201).send({status:true,data:createUrl})
    }catch(err){
      return  res.status(500).send({status:false,message:err.message})
    }
}

module.exports.shortUrl = shortUrl;

//>>>>>>>>>>>>>>>>>>>>>>> Redirect to the original url <<<<<<<<<<<<<<<<<<<<

const getUrl = async function(req,res){
    try{
        const shortid = req.params.urlCode
        const result = await urlModel.findOne({urlCode:shortid})

        if(!result){
            return res.status(404).send({status:false,msg:"ShortUrl doesn't exist"})
        }
        
        return res.status(200).redirect(result.longUrl)


    }catch(error){
        return res.status(500).send({status:false,error:error.message});
    }
}

module.exports.getUrl = getUrl