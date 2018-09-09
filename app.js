const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
// const credential = require('./config');
let multer = require('multer');
let upload = multer();
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const BUCKET_NAME = 'nm-photobooth-wi';
const S3_LINK = 'https://s3-us-west-2.amazonaws.com/nm-photobooth-wi/';


var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://dat-day-z.auth0.com/.well-known/jwks.json"
  }),
  audience: 'http://ec2-34-221-7-217.us-west-2.compute.amazonaws.com/api',
  issuer: "https://dat-day-z.auth0.com/",
  algorithms: ['RS256']
});

app.use(jwtCheck);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(bodyParser.json());

// routes
app.get('/', (req, res) => {
  res.send(200, 'Server is running!!!')
});

app.get('/authorized', function (req, res) {
  res.send('Secured Resource');
});
var s3 = new AWS.S3();
// For dev purposes only
AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey
});

app.get('/api/list/bucket', (req, res) => {
  s3.listBuckets((err, data) => {
    if (err) console.log(err, err.stack);
    else res.send(200, data.Buckets);
  });
});

app.post('/api/upload', upload.array('files', 12), (req, res) => {
  let formData = req.files[0];
  s3.putObject({
    Bucket: BUCKET_NAME,
    Key: req.body.folder + '/' + formData.originalname,
    Body: formData.buffer,
  }, function (error, resp) {
    if (error) res.send(500, error.stack);
    console.log(arguments);
    console.log('Successfully uploaded package.');
    res.send(201);
  });

});

app.get('/api/list/folder/:name', (req, res) => {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: req.params.name,
  };
  const result = [];
  console.log(process.env)
  s3.listObjects(params, function (err, data) {
    if (err) {
      res.send(500, err.stack);
    } else {
      for (let i = 0; i < data.Contents.length; i++) {
        result.unshift(S3_LINK + data.Contents[i].Key);
      }
      res.send(200, result);
    }
  });
});

app.get('/api/list/folder/first/:name', (req, res) => {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: req.params.name,
  };
  const result = [];
  s3.listObjects(params, function (err, data) {
    if (err) {
      res.send(500, err.stack);
    } else {
      for (let i = 0; i < data.Contents.length; i++) {
        result.unshift(S3_LINK + data.Contents[i].Key);
      }
      res.send(200, result.slice(0, 7));
    }
  });
});


module.exports = app;
