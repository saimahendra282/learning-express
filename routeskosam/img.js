const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region:          process.env.AWS_REGION
});

const bucketName = process.env.S3_BUCKET_NAME;

// Multer config — store in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// ──────────────────────────────
// GET /mg — Retrieve image
// ──────────────────────────────
router.get('/mg', (req, res) => {
  const s3Key = 'img/zoro-run.gif';
  const ext = path.extname(s3Key).toLowerCase();

  let contentType = 'application/octet-stream';
  if (ext === '.gif') contentType = 'image/gif';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

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


// ──────────────────────────────
// POST /upload-mg — Upload image
// ──────────────────────────────
router.post('/upload-mg', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  const file = req.file;
  const ext = path.extname(file.originalname).toLowerCase();

  let contentType = 'application/octet-stream';
  if (ext === '.gif') contentType = 'image/gif';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

  const params = {
    Bucket: bucketName,
    Key: `img/${file.originalname}`,
    Body: file.buffer,
    ContentType: contentType,
  };

  try {
    await s3.upload(params).promise();
    res.json({ message: 'Upload successful' });
  } catch (err) {
    console.error('S3 Upload Error:', err);
    res.status(500).send('Failed to upload to S3');
  }
});

module.exports = router;
