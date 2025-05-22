const express = require('express');
const path = require('path');
const AWS = require('aws-sdk');
const router = express.Router();

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const bucketName = process.env.S3_BUCKET_NAME;

router.get('/pdf', (req, res) => {
  // Local file send logic (commented out)
  /*
  const filePath = path.join(__dirname, '..', 'assets', 'allpurpose.pdf');
  return res.sendFile(filePath);
  */

  // S3 key for the file inside the bucket's `pdf` folder
  const s3Key = 'pdf/allpurpose.pdf';

  const params = {
    Bucket: bucketName,
    Key: s3Key,
  };

  const stream = s3.getObject(params).createReadStream();

  stream.on('error', (err) => {
    console.error('Error streaming PDF from S3:', err);
    return res.status(500).send('Error retrieving PDF file');
  });

  res.setHeader('Content-Type', 'application/pdf');
  stream.pipe(res);
});

module.exports = router;
