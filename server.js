//require("dotenv").config() //ignore

//console.log(process.env); // ignore 

const express = require('express'); // "imports" express framework
const mongoose = require('mongoose');
const app = express(); // creates the webapp
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios')
const path = require('path');
const router = express.Router();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = {
    swaggerDefinition: {
        swagger: '2.0',
      info: {
        version: "1.0.0",
        title: "Delish API",
        description: "Delish API ratings information",
        contact: {
          name: "Cyrus Karsan"
        }
      }
    },
    apis: ["server.js"]
  };

//define the OpenAPI doc
const swaggerDocs = swaggerJsDoc(swaggerOptions);
console.log(swaggerDocs);

//setup the visual api doc tester
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use(bodyParser.json());
app.use(cors());


const MongoClient = require('mongodb').MongoClient; //create client to use mongodb
const uri = `mongodb+srv://delishfood:delishfood@cluster0.ailvm.mongodb.net/delishfood?retryWrites=true&w=majority`; //url to connect to mongodb atlas cluster
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); //initalize our client

const RatingSchema = mongoose.Schema({
    placeid: String,
    rating: {
        type: Number,
        default: 0
    }
});

const ratingDoc = mongoose.model('ratingDoc', RatingSchema);

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, () =>
    console.log("Connected to database!"));

/*async function upVote(client, id) {
    await client.connect();
    result = await client.db("delishfood").collection("ratings")
    .updateOne({ _id: "sample_place" }, { $inc: { rating: 1} });
    console.log("Found id:" + id);
}

upVote(client, "sample_place");*/

app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, '/public')));

/**
 * @swagger
 * /:
 *  get:
 *    summary: Retrieves all documents in the ratings collection in MongoDB
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get('/', async (req, res) => {
    try {
        const getRatings = await ratingDoc.find();
        res.json(getRatings);
    }
    catch (err) {
        res.json({ message: err });
    }
});

/**
 * @swagger
 * /:
 *  post:
 *    summary: Add a new rating to the ratings collection in MongoDB
 *    description: Create a new document in the ratings collection of the resturant and it's rating
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      id:
 *                          type: string
 *                      rating:
 *                          type: integer
 *                          format: int64
 *                          minimum: 1
 * 
 *
 *    responses:
 *      '200':
 *        description: Rating added successfully
 */
router.post('/', async (req, res) => {
    const rating = new ratingDoc({
        // placeid: req.body.placeid,
        _id: req.body._id,
        rating: req.body.rating
    });
    try {
        const savedRating = await rating.save();
        res.json(savedRating);
    }
    catch (err) {
        res.json({ message: err });
    }
});

/**
 * @swagger
 * /{mongo_id}:
 *  get:
 *    summary: Retrieves document of given id
 *    description: Given a unique MongoDB document _id, return the data associated with the document.
 *    parameters:
 *      - name: mongo_id
 *        in: path 
 *        required: true
 *        description: unique document _id
 *        schema:
 *          type: string    
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get('/:mongo_id', async (req, res) => {
    try {
        const findSpecificDoc = await ratingDoc.findById(req.params.mongo_id);
        res.json(findSpecificDoc);
    }
    catch (err) {
        res.json({ message: err });
    }
});

/**
 * @swagger
 * /{mongo_id}:
 *  delete:
 *    summary: Removes document from ratings collection
 *    description: Given a unique MongoDB document _id, delete the document associated with the _id
 *    parameters:
 *      - name: mongo_id
 *        in: path 
 *        required: true
 *        description: unique document _id
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.delete('/:mongo_id', async (req, res) => {
    try {
        const removedDoc = await ratingDoc.remove({ _id: req.params.mongo_id});
        res.json(removedDoc);
    }
    catch (err) {
        res.json({ message: err });
    }
});

/**
 * @swagger
 * /{mongo_id}:
 *  patch:
 *    summary: increment rating of resturant in document
 *    parameters:
 *      - name: mongo_id
 *        in: path 
 *        required: true
 *        description: unique document _id
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.patch('/:mongo_id', async (req, res) => {
    try {
        const updatedDoc = await ratingDoc.updateOne({ _id: req.params.mongo_id }, { $inc: { rating: 1 } });
        res.json(updatedDoc);
    }
    catch (err) {
        res.json({ message: err });
    }
});


app.use('/', router);

app.listen(process.env.port || 8080);

console.log('Server listening on port 8080!');
console.log('Open up a browser and go to localhost:8080/');
