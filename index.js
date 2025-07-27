const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

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

app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const receivedMessage = webhookEvent.message.text;
        callSendAPI(senderPsid, `Вы написали: ${receivedMessage}`);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

function callSendAPI(senderPsid, responseText) {
  axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: senderPsid },
    message: { text: responseText }
  }).catch(err => {
    console.error('Ошибка при отправке сообщения:', err.response ? err.response.data : err.message);
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
