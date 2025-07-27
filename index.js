const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.use(bodyParser.json());

// Проверка вебхука (GET)
app.get('/', (req, res) => {
  res.send('Facebook Bot is running');
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Обработка сообщений (POST)
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

      console.log('📩 Получено сообщение:', webhookEvent);

      if (webhookEvent.message && webhookEvent.message.text) {
        const receivedText = webhookEvent.message.text;
        sendMessage(senderPsid, `Вы написали: ${receivedText}`);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Функция отправки сообщения обратно в Messenger
function sendMessage(senderPsid, text) {
  axios.post(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: senderPsid },
    message: { text: text }
  })
  .then(() => {
    console.log('✉️ Сообщение отправлено');
  })
  .catch(error => {
    console.error('❌ Ошибка при отправке сообщения:', error.response?.data || error.message);
  });
}

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
