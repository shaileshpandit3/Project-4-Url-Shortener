const urlModel = require('../models/urlModel.js')
const shortid = require('shortid');
const validator = require('../validator/validator.js')
const redis = require('redis')
const { promisify } = require("util");
const { isValid } = require('shortid');
// const isValidUrl = require("valid-url")

// redis initialization

const redisClient = redis.createClient({ host: 'redis-17454.c15.us-east-1-4.ec2.cloud.redislabs.com', port: 17454, username: 'functioup-free-db', password: 'yiIOJJ2luH3yHDzmp0WppDFtuUxn5aqO' });

redisClient.on('connect', () => {
    console.log('connected to redis successfully!');
})

redisClient.on('error', (error) => {
    console.log('Redis connection error :', error);
})



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//>>>>>>>>>>>>>>>>>>>>> Generate short Url <<<<<<<<<<<<<<<<<<<<<<<


const createShortUrl = async function (req, res) {
    try {

        const longUrl1 = req.body

        if (Object.keys(longUrl1).length == 0) { return res.status(400).send({ status: false, message: "please input some data in body" }) }

        const { longUrl } = longUrl1

        if (!validator.isValidUrl(longUrl)) {
            return res.status(400).send({ status: false, message: "Please Provide a valid url" })
        }

        if (!(/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(longUrl))) {
            return res.status(400).send({ status: false, message: "Invalid LongURL" })
        }


        if (!longUrl) {

            return res.status(400).send({ status: false, message: "please provide required input field" })

        }

        const baseUrl = "http://localhost:3000"

        // if (!isValidUrl.isUri(baseUrl)) {

        //     return res.status(400).send({ status: false, message: "invalid base URL" })

        // }

        const cahcedUrlData = await GET_ASYNC(`${longUrl}`)

        if (cahcedUrlData) {
            
            return res.status(200).send({ status: true, data:JSON.parse(cahcedUrlData) })

        }

        let urlPresent = await urlModel.findOne({ longUrl: longUrl }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })

        if (urlPresent) {

            await SET_ASYNC(`${longUrl}`, JSON.stringify(urlPresent))

            return res.status(200).send({ status: true, data: urlPresent  })

        }

        const urlCode = shortid.generate().toLowerCase()

        const shortUrl = baseUrl + '/' + urlCode

        const newUrl = {
            longUrl: longUrl,
            shortUrl: shortUrl,
            urlCode: urlCode
        }


        const createUrl = await urlModel.create(newUrl)
        let data = createUrl.toObject()
        delete data.createdAt
        delete data.updatedAt
        delete data.__v
        delete data._id
        await SET_ASYNC(`${longUrl}`, JSON.stringify(data))
        return res.status(201).send({ status: true, data: data })

    }

    catch (err) {

        return res.status(500).send({ status: false, message: err.message })

    }

}



module.exports.createShortUrl = createShortUrl;

//>>>>>>>>>>>>>>>>>>>>>>> Redirect to the original url <<<<<<<<<<<<<<<<<<<<

const getUrl = async (req, res) => {
  try {
     let urlCode = req.params.urlCode
    let cachedData = await GET_ASYNC(urlCode);
   console.log(cachedData)
if (cachedData) {
 let copy = JSON.parse(cachedData)
          
return res.status(302).redirect(copy.longUrl);
            
} 
        const url = await urlModel.findOne({ urlCode: req.params.urlCode });
       // console.log(url)
        if (url) {
           await SET_ASYNC(`${urlCode}`,JSON.stringify(url))
         //  console.log("dataFromMongoDb")
          return res.status(302).redirect(url.longUrl);
        } else {
          return res.status(404).json({ status: false, msg: "URL not found" });
        }
      } catch (error) {
        res.status(500).json({ status: false, msg: error.message });
      }
    };
    
module.exports.getUrl = getUrl


 
