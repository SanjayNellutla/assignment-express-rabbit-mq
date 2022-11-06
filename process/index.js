const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const amqplib = require('amqplib');
const { events, QUEUE_NAME } = require("./lib");
const processService = require("./services/process");

app.use(bodyParser.json()) 

const listenEvents = async (channel) => {
  try {
   await channel.consume(QUEUE_NAME, (message) => {
      const { event, body } = JSON.parse(message.content.toString()) || {};
      if (event === events.SLIDE_CREATED) {
        processService.process(body, channel);
      }
      // channel.ack(message);
    });
  } catch (err) {
    console.log(err);
  }
};

app.listen(4000, async () => {
  const connection = await amqplib.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);
  await listenEvents(channel);
});