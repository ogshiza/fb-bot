
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Facebook Bot is running');
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});
