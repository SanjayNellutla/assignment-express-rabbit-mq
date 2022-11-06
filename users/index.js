const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const amqplib = require('amqplib');
const { getQueueChannel } = require('./queues');
const { events, QUEUE_NAME } = require("./lib");
const storageService = require("./services/storage")

app.use(bodyParser.json()) 

const listenEvents = async (channel) => {
  try {
    await channel.consume(QUEUE_NAME, (message) => {
      const { event, body } = JSON.parse(message.content.toString()) || {};
      if (event === events.PROCESS_COMPLETED) {
        storageService.update(body, channel);
      }
      // channel.ack(message);
    });
  } catch (err) {
    console.log(err);
  }
};

app.listen(8000, async() => {
  const connection = await amqplib.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);
  listenEvents(channel);
});