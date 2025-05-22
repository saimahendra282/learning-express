const path = require('path');
const AWS = require('aws-sdk');
const express = require('express');
const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const bucketName = process.env.S3_BUCKET_NAME;

router.get('/mg', (req, res) => {
  // const filePath = path.join(__dirname, '..', 'assets', 'zoro-run.gif');
  // return res.sendFile(filePath);

  const s3Key = 'img/zoro-run.gif';
  const ext = path.extname(s3Key).toLowerCase(); // ".gif"

  let contentType;

  if (ext === '.gif') contentType = 'image/gif';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else contentType = 'application/octet-stream'; // fallback

  const params = {
    Bucket: bucketName,
    Key: s3Key,
  };

  const stream = s3.getObject(params).createReadStream();

  stream.on('error', (err) => {
    console.error('Error streaming from S3:', err);
    return res.status(500).send('Error retrieving file');
  });

  res.setHeader('Content-Type', contentType);
  stream.pipe(res);
});

module.exports = router;
