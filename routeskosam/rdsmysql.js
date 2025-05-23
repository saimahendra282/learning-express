const express = require('express');
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// DynamoDB config
AWS.config.update({ region: process.env.AWS_REGION });
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

// ───── Signup ─────
router.post('/signup', async (req, res) => {
  const { email, passkey } = req.body;
  if (!email || !passkey) return res.status(400).send('Missing email or passkey');

  try {
    const hashed = await bcrypt.hash(passkey, 10);

    await dynamo.put({
      TableName: TABLE_NAME,
      Item: {
        email,
        passkeyHash: hashed,
        createdAt: new Date().toISOString()
      },
      ConditionExpression: 'attribute_not_exists(email)'
    }).promise();

    res.status(201).send('User registered');
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      res.status(409).send('Email already exists');
    } else {
      console.error(err);
      res.status(500).send('Error during signup');
    }
  }
});

// ───── Login ─────
router.post('/login', async (req, res) => {
  const { email, passkey } = req.body;
  if (!email || !passkey) return res.status(400).send('Missing email or passkey');

  try {
    const data = await dynamo.get({
      TableName: TABLE_NAME,
      Key: { email }
    }).promise();

    const user = data.Item;
    if (!user) return res.status(404).send('User not found');

    const isMatch = await bcrypt.compare(passkey, user.passkeyHash);
    if (!isMatch) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
});

module.exports = router;
