const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const amqplib = require('amqplib');
const { events, queues, CONNECTION } = require("./lib");

let connection = null;

app.use(bodyParser.json()) 

const updateUserStorage = async (slide) => {
  const output = {
    event: events.STORAGE_UPDATE,
    body: slide,
  }
  const channel = await connection.createChannel();
  await channel.sendToQueue(queues.SLIDES, Buffer.from(JSON.stringify(output)));
  console.log(4, 'storage updated');
};


const listenEvents = async () => {
  try {
    const channel = await connection.createChannel();
    await channel.consume(queues.USERS, (message) => {
      // console.log('users: Lisenting event');
      const { event, body } = JSON.parse(message.content.toString()) || {};
      if (event === events.PROCESS_COMPLETED) {
        updateUserStorage(body);
        channel.ack(message);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

app.listen(8000, async() => {
  try {
    connection = await amqplib.connect(CONNECTION);
    listenEvents();
  } catch (err) {
    console.log(err);
  }
});