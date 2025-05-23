// routeskosam/metricMp4.js
const express     = require('express');
const path        = require('path');
const AWS         = require('aws-sdk');
const router      = express.Router();

const s3 = new AWS.S3({
  accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region:          process.env.AWS_REGION
});

const bucketName = process.env.S3_BUCKET_NAME;
const s3Key      = 'mp4/sample.mp4';

// Helper to log metrics
function logMetrics(label, start) {
  const durationMs = Date.now() - start;
  const mem = process.memoryUsage();
  console.log(`\n[${label}]`);
  console.log(`  Time: ${durationMs} ms`);
  console.log(`  RSS:  ${(mem.rss  / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Heap Used: ${(mem.heapUsed  / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  External: ${(mem.external / 1024 / 1024).toFixed(2)} MB\n`);
}

// ─────────────────────────────────────────────────
// 1) Normal full-stream endpoint
// GET /mp4
// ─────────────────────────────────────────────────
router.get('/mp4', (req, res) => {
  const start = Date.now();
  const params = { Bucket: bucketName, Key: s3Key };

  const stream = s3.getObject(params).createReadStream();
  res.setHeader('Content-Type', 'video/mp4');

  stream.on('error', err => {
    console.error('Error streaming MP4 from S3:', err);
    res.status(500).send('Error retrieving video file');
  });

  stream.on('end', () => {
    logMetrics('Full Stream (/mp4)', start);
  });

  stream.pipe(res);
});

// ─────────────────────────────────────────────────
// 2) Range-based algorithmic stream endpoint
// GET /algomp4
// ─────────────────────────────────────────────────
router.get('/algomp4', async (req, res) => {
  const start = Date.now();
  try {
    const head = await s3.headObject({ Bucket: bucketName, Key: s3Key }).promise();
    const total = head.ContentLength;
    const range = req.headers.range;

    if (!range) {
      // No range: full stream
      res.writeHead(200, {
        'Content-Length': total,
        'Content-Type':   'video/mp4',
        'Accept-Ranges':  'bytes'
      });
      const fullStream = s3.getObject({ Bucket: bucketName, Key: s3Key }).createReadStream();
      fullStream.pipe(res).on('end', () => logMetrics('Algo Stream Full (/algomp4)', start));
      return;
    }

    // Parse Range
    const parts = range.replace(/bytes=/, '').split('-');
    const startByte = parseInt(parts[0], 10);
    const endByte   = parts[1] ? parseInt(parts[1], 10) : total - 1;
    const chunkSize = (endByte - startByte) + 1;

    // Headers for partial content
    res.writeHead(206, {
      'Content-Range':  `bytes ${startByte}-${endByte}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type':   'video/mp4'
    });

    // Stream range
    const rangeStream = s3.getObject({
      Bucket: bucketName,
      Key:    s3Key,
      Range:  `bytes=${startByte}-${endByte}`
    }).createReadStream();

    rangeStream.on('error', err => {
      console.error('Range stream error:', err);
      res.sendStatus(500);
    });

    rangeStream.on('end', () => {
      logMetrics(`Algo Stream Partial (${startByte}-${endByte})`, start);
    });

    rangeStream.pipe(res);
  } catch (err) {
    console.error('Error in /algomp4:', err);
    res.sendStatus(500);
  }
});

module.exports = router;
