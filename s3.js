const AWS = require('aws-sdk');
const credential = require('./config');

const s3 = new AWS.S3();
AWS.config.update({
  accessKeyId: process.env.accessKeyId || credential.ACCESS_KEY_ID,
  secretAccessKey: process.env.secretAccessKey || credential.ACCESS_KEY_SECRET
});
const BUCKET_NAME = 'nm-photobooth-wi';
const S3_LINK = 'https://s3-us-west-2.amazonaws.com/nm-photobooth-wi/';

const add = function(folder, name, buffer, cb) {
  s3.putObject({
    Bucket: BUCKET_NAME,
    Key: folder + '/' + name,
    Body: buffer,
  }, function (resp) {
    cb(resp);
    console.log(arguments);
    console.log('Successfully uploaded package.');
  });
};

const list = function(prefix, cb) {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  };
  const result = [];
  s3.listObjects(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      for (let i = 0; i < data.Contents.length; i++) {
        result.push(S3_LINK + data.Contents[i].Key);
      }
      cb(result);
    }
  });
};

module.exports = {
  add,
  list
};
