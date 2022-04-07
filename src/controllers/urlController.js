const urlModel = require('../models/urlModel.js')
const shortid = require('shortid');
const validator = require('../validator/validator.js')
const config = require('config')
const redis = require('redis')
const { promisify } = require("util");
const isValidUrl = require("valid-url")

// redis initialization

// const redisClient = redis.createClient({host:'redis-13308.c264.ap-south-1-1.ec2.cloud.redislabs.com',port:17454,username:'shailesh-free-db',password:'hKjsottYqwYw75XTWYDvyQlm4iQkI4Ty'});

// redisClient.on('connect',() => {
//     console.log('connected to redis successfully!');
// })

// redisClient.on('error',(error) => {
//     console.log('Redis connection error :', error);
// })


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
            return res.status(400).send({ status: false, message: "Long URL required" })
        }

        if (!(/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(longUrl))) {
            return res.status(400).send({ status: false, message: "Invalid LongURL" })
        }


        if (!longUrl) {

            return res.status(400).send({ status: false, message: "please provide required input field" })

        }

        const baseUrl = "http://localhost:3000"

        if (!isValidUrl.isUri(baseUrl)) {

            return res.status(400).send({ status: false, message: "invalid base URL" })

        }

        const cahcedUrlData = await GET_ASYNC(`${longUrl}`)

        if (cahcedUrlData) {

            return res.status(200).send({ status: "true", data: cahcedUrlData })

        }

        let urlPresent = await urlModel.findOne({ longUrl: longUrl }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })

        if (urlPresent) {

            await SET_ASYNC(`${longUrl}`, JSON.stringify(urlPresent))

            let newOne = JSON.parse(urlPresent)

            return res.status(200).send({ status: true, data: newOne.longUrl })

        }

        const urlCode = shortid.generate()

        const url = await urlModel.findOne({ urlCode: urlCode })

        if (url) {

            return res.status(400).send({ status: false, message: "urlCode already exist in tha db", Data: url })

        }

        const shortUrl = baseUrl + '/' + urlCode

        const dupshortUrl = await urlModel.findOne({ shortUrl: shortUrl })

        if (dupshortUrl) {

            return res.status(400).send({ status: false, message: "shortUrl already exist in tha db" })

        }

        const newUrl = {
            longUrl: longUrl,
            shortUrl: shortUrl,
            urlCode: urlCode
        }


        const createUrl = await urlModel.create(newUrl)

        return res.status(201).send({ status: true, data: createUrl })

    }

    catch (err) {

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

