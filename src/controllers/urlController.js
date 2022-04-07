const urlModel = require('../models/urlModel.js')
const shortid = require('shortid');
const validator = require('../validator/validator.js')
const config = require('config')
const redis= require('redis')
const { promisify } = require("util");

// redis initialization

// const redisClient = redis.createClient({host:'redis-13308.c264.ap-south-1-1.ec2.cloud.redislabs.com',port:17454,username:'shailesh-free-db',password:'hKjsottYqwYw75XTWYDvyQlm4iQkI4Ty'});

// redisClient.on('connect',() => {
//     console.log('connected to redis successfully!');
// })

// redisClient.on('error',(error) => {
//     console.log('Redis connection error :', error);
// })

const redisClient = redis.createClient(
    13308,
    "redis-13308.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("hKjsottYqwYw75XTWYDvyQlm4iQkI4Ty", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});




//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//>>>>>>>>>>>>>>>>>>>>> Generate short Url <<<<<<<<<<<<<<<<<<<<<<<

const createShortUrl = async function (req, res) {
    try {
        const data = req.body
        const longUrl = req.body.longUrl.toLowerCase().trim();
        const baseUrl = config.get('baseUrl')

        if (!validator.longUrlPresent(data)) {
            return res.status(400).send({ status: false, msg: "Please enter long Url" })
        }
        if (!validator.isValidUrl(longUrl)) {
            return res.status(400).send({ status: false, msg: ` 'Please give a valid longUrl' ` })
        }



        const changeUrl = await urlModel.findOne({ longUrl: longUrl })
        if (changeUrl) {
            return res.status(200).send({ status: true, data: changeUrl })
        }

        const urlCode = shortid.generate().toLowerCase()
        const shortUrl = baseUrl + '/' + urlCode.toLowerCase()
        let url = {
            longUrl,
            shortUrl,
            urlCode
        }
        
        
        const createUrl = await urlModel.create(url)
        await SET_ASYNC(urlCode.toLowerCase(), longUrl)
        return res.status(201).send({ status: true, data: createUrl })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.createShortUrl = createShortUrl;

//>>>>>>>>>>>>>>>>>>>>>>> Redirect to the original url <<<<<<<<<<<<<<<<<<<<

const getUrl = async function (req, res) {
    try {

      let cachedData = await GET_ASYNC(req.params.urlCode.trim().toLowerCase());
      if (cachedData) {
        console.log("data from cache memory")
        res.status(302).redirect(cachedData);
      }
        const shortid = req.params.urlCode
        const result = await urlModel.findOne({ urlCode: shortid })

        if (!result) {
            return res.status(404).send({ status: false, msg: "ShortUrl doesn't exist" })
        }

        return res.status(200).redirect(result.longUrl)


    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}

module.exports.getUrl = getUrl

