const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const amqplib = require('amqplib');
const { events, queues, CONNECTION } = require("./lib");
let connection = null;

app.use(bodyParser.json())

const onProcessComplete = async (slide) => {
  const channel = await connection.createChannel();
  const output = {
    event: events.PROCESS_COMPLETED,
    body: slide,
  }
  setTimeout(() => {
    channel.sendToQueue(queues.USERS, Buffer.from(JSON.stringify(output)));
    console.log(3, 'procesing completed');
  }, 10000)
}

const process = async (slide) => {
  const channel = await connection.createChannel();
  const output = {
    event: events.PROCESS_STARTED,
    body: slide,
  }
  await channel.sendToQueue(queues.SLIDES, Buffer.from(JSON.stringify(output)));
  console.log(2, 'procesing started');
  onProcessComplete(slide);
};

const listenEvents = async () => {
  try {
   const channel = await connection.createChannel();
   await channel.consume(queues.PROCESS, (message) => {
      // console.log('process: Lisenting event');
      const { event, body } = JSON.parse(message.content.toString()) || {};
      if (event === events.SLIDE_CREATED) {
        channel.ack(message);
        process(body)
      }
    });
  } catch (err) {
    console.log(err);
  }
};

app.listen(4000, async () => {
  connection = await amqplib.connect(CONNECTION);
  await listenEvents();
});