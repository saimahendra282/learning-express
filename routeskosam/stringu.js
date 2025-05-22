const express = require('express');
const router = express.Router();
router.get('/e', (req, res) => {
  res.send('sample response from express route');
});
module.exports = router;
