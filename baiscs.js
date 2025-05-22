// ────────────────────────────────────────────────────
// 1. IMPORTS
// ────────────────────────────────────────────────────
const express     = require('express');
const cors        = require('cors');
const path        = require('path');  // if you need for static files or assets
require('dotenv').config();
// Routers
const expressroutes = require('./routeskosam/stringu');
const formRouter    = require('./routeskosam/form');
const imgRouter     = require('./routeskosam/img');
const pdfRouter     = require('./routeskosam/pdf');
const mp4Router     = require('./routeskosam/mp4');

// ────────────────────────────────────────────────────
// 2. APP SETUP
// ────────────────────────────────────────────────────
const app  = express();
const port = 8888;

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies for POST requests
app.use(express.json());

// ────────────────────────────────────────────────────
// 3. ROUTES (STATIC / SIMPLE RESPONSES)
// ────────────────────────────────────────────────────

// Root endpoint: simple text
app.get('/', (req, res) => {
  res.status(200).send('basic sample for / endpoint');
});

// HTML endpoint: returns a small HTML page with an image
app.get('/html', (req, res) => {
  res
    .status(200)
    .type('html')
    .send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Sample HTML</title>
        </head>
        <body>
          <h1>Sample html response from server</h1>
          <img
            src="https://tse2.mm.bing.net/th?id=OIP.cshov3OTetngKfZo4DvqTAHaHa&pid=Api&P=0&h=180"
            alt="Cat"
          />
        </body>
      </html>
    `);
});

// ────────────────────────────────────────────────────
// 4. ROUTER MOUNTS (UNDER /express-route)
// ────────────────────────────────────────────────────
// All of these share the same base path: /express-route
app.use('/express-route', expressroutes); // routeskosam/stringu.js
app.use('/express-route', formRouter);    // routeskosam/form.js
app.use('/express-route', imgRouter);     // routeskosam/img.js
app.use('/express-route', pdfRouter);     // routeskosam/pdf.js
app.use('/express-route', mp4Router);     // routeskosam/mp4.js

// ────────────────────────────────────────────────────
// 5. START SERVER
// ────────────────────────────────────────────────────
app.listen(port, (err) => {
  if (err) {
    console.error('❌ Server failed to start:', err);
  } else {
    console.log(`✅ Server is running on http://localhost:${port}`);
  }
});
