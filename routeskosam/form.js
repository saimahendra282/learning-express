const express = require('express');
const router = express.Router();
const cors = require('cors');
router.use(cors());
router.post('/f', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send('Missing name');
  }
  res.send(`Hello ${name}`);
});
module.exports = router;
