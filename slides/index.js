const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const amqplib = require('amqplib');
const { getQueueChannel } = require('./queues');
const { events, QUEUE_NAME } = require("./lib");
// const processService = require("./services/process");

app.use(bodyParser.json()) 

const initApp = (channel) => {
  app.post('/create', async (req, res) => {
    const { body } = req;
    try {
      channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({
        event: events.SLIDE_CREATED,
        body,
      })));
      console.log(1, 'slide record created');
      res.status(200).send(body)
    } catch (err) {
      console.log(err);
      res.status(500).send(err)
    }
  })
};

const listenEvents = async (channel) => {
  try {
    await channel.consume(QUEUE_NAME, (message) => {
      const { event } = JSON.parse(message.content.toString()) || {};
      if (event === events.STORAGE_UPDATE) {
        console.log(4, "Update slide data after process completion");
      } else if (event === events.STORAGE_UPDATE_FAIL) {
        console.log(4, "Update slide data after process failure");
      }
      // channel.ack(message);
    });
    return true;
  } catch (err) {
    console.log(err);
  }
};

app.listen(3000, async () => {
  const connection = await amqplib.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);
  await listenEvents(channel);
  initApp(channel);
});