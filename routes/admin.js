const express = require('express');

const Tool = require('../models/tool.js');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.send('Admin interface available');
});

router.get('/tools', async (req, res) => {
  const tools = await Tool.find();
  res.send(tools);
});

router.post('/tools', async (req, res) => {
  const tool = new Tool(req.body);
  try {
    await tool.save();
    res.send(tool);
  } catch (exception) {
    res.status(500).send(exception);
  }
});

router.delete('/tools/:clientId', async (req, res) => {
  try {
    await Tool.deleteOne({ clientId: req.params.clientId });
    res.send(true);
  } catch (exception) {
    res.status(500).send(exception);
  }
});

module.exports = router;
