const express = require('express');
const path = require('path');
const AWS = require('aws-sdk');
const router = express.Router();
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
const bucketName = process.env.S3_BUCKET_NAME;
router.get('/mp4', (req, res) => {
  // Local file sending (commented)
  /*
  const filePath = path.join(__dirname, '..', 'assets', 'sample.mp4');
  return res.sendFile(filePath);
  */
  const s3Key = 'mp4/sample.mp4';
  const params = {
    Bucket: bucketName,
    Key: s3Key,
  };
  const stream = s3.getObject(params).createReadStream();
  stream.on('error', (err) => {
    console.error('Error streaming MP4 from S3:', err);
    res.status(500).send('Error retrieving video file');
  });
  res.setHeader('Content-Type', 'video/mp4');
  stream.pipe(res);
});
module.exports = router;
