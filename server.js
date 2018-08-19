const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const credential = require('./config');
let multer = require('multer');
let upload = multer();

const BUCKET_NAME = 'nm-photobooth-wi';
const S3_LINK = 'https://s3-us-west-2.amazonaws.com/nm-photobooth-wi/';

const port = 8080;
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());

// routes
app.get('/', (req, res) => {
  res.send(200, 'Server is running!!!' + Object.keys(process.env) + credential)
});

var s3 = new AWS.S3();
// For dev purposes only
AWS.config.update({
  accessKeyId: process.env.accessKeyId || credential.ACCESS_KEY_ID,
  secretAccessKey: process.env.secretAccessKey || credential.ACCESS_KEY_SECRET
});

app.get('/api/list/bucket', (req, res) => {
  s3.listBuckets((err, data) => {
    if (err) console.log(err, err.stack);
    else res.send(200, data.Buckets);
  });
});

app.post('/api/upload', upload.array('files', 12), (req, res) => {
  let formData = req.files;
  console.log(formData);
  for(let i = 0; i < formData.length; i++) {
    s3.putObject({
        Bucket: BUCKET_NAME,
        Key: req.folder + '/' + formData[i].originalname,
        Body: formData[i].buffer,
      }, function (resp) {
        console.log(arguments);
        console.log('Successfully uploaded package.');
      });
  }
  res.send(201);
});

app.get('/api/list/:folder', (req, res) => {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: req.params.folder,
  };
  const result = [];
  s3.listObjects(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      for(let i = 0 ; i < data.Contents.length; i ++) {
        result.push(S3_LINK + data.Contents[i].Key);
      }
      res.send(200, result);
    }
  });
});


app.listen(port, err => {
  if (err) throw new Error(err);
  console.log('server running on port ' + port);
});

module.exports = app;
