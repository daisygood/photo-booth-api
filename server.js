const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const credential = require('./config');
const s3 = require('./s3.js');
const multer = require('multer');
const upload = multer();

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

app.get('/api/list/bucket', (req, res) => {
  s3.listBuckets((err, data) => {
    if (err) console.log(err, err.stack);
    else res.send(200, data.Buckets);
  });
});

app.post('/api/upload', upload.array('files', 12), (req, res) => {
  let formData = req.files;
  for (let i = 0; i < formData.length; i++) {
    s3.add(req.folder, formData[i].originalname, formData[i].buffer, resp => {
      console.log(resp);
    });
  }
  res.send(201);
});

app.get('/api/list/:folder', (req, res) => {
  s3.list(req.params.folder, result => {
    res.send(200, result);
  });
});


app.listen(port, err => {
  if (err) throw new Error(err);
  console.log('server running on port ' + port);
});

module.exports = app;
