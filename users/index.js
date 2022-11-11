const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const amqplib = require('amqplib');
const { events, queues, exchanges, getBufferFromObject, CONNECTION_URL } = require("./lib");

let connection = null;

app.use(bodyParser.json())

const updateUserStorage = async (slide) => {
  const output = {
    event: events.STORAGE_UPDATE,
    body: slide,
  }
  const channel = await connection.createChannel();
  await channel.assertExchange(exchanges.topic.key, exchanges.topic.type);
  await channel.publish(exchanges.topic.key, events.STORAGE_UPDATE, getBufferFromObject(output));
  // await channel.sendToQueue(queues.SLIDES, Buffer.from(JSON.stringify(output)));
  // console.log(4, 'storage updated');
};


const listenEvents = async () => {
  try {
  const channel = await connection.createChannel();
   await channel.assertExchange(exchanges.topic.key, exchanges.topic.type);
   await channel.assertQueue(queues.USERS);
   await channel.bindQueue(queues.USERS, exchanges.topic.key, events.PROCESS_COMPLETED);
   await channel.consume(queues.USERS, (message) => {
      console.log(message.fields.routingKey);
      const body = JSON.parse(message.content.toString()) || {};
      if (message.fields.routingKey === events.PROCESS_COMPLETED) {
        updateUserStorage(body);
      }
      channel.ack(message);
    });
  } catch (err) {
    console.log(err);
  }
};

app.listen(9000, async() => {
  try {
    connection = await amqplib.connect(CONNECTION_URL);
    listenEvents();
  } catch (err) {
    console.log(err);
  }
});