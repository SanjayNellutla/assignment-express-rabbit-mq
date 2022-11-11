const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const amqplib = require('amqplib');
const { events, queues, CONNECTION_URL, exchanges, getBufferFromObject, PORT } = require("./lib");
let connection = null;

app.use(bodyParser.json())

const onProcessComplete = async (slide) => {
  const channel = await connection.createChannel();
  await channel.assertExchange(exchanges.topic.key, exchanges.topic.type);
  setTimeout(() => {
    // channel.sendToQueue(queues.USERS, Buffer.from(JSON.stringify(output)));
    channel.publish(exchanges.topic.key, events.PROCESS_COMPLETED, getBufferFromObject(slide));
  }, 10000)
}

const process = async (slide) => {
  const channel = await connection.createChannel();
  await channel.assertExchange(exchanges.topic.key, exchanges.topic.type);
  await channel.publish(exchanges.topic.key, events.PROCESS_STARTED, getBufferFromObject(slide));
  onProcessComplete(slide);
};

const listenEvents = async () => {
  try {
    // ch.assertExchange(_EXCHANGE, 'topic', { durable: true, autoDelete: false });
    //   ch.assertQueue(_QUEUE, { durable: true, autoDelete: false, exclusive: false });
    //   ch.bindQueue(_QUEUE, _EXCHANGE, _ROUTING);
   const channel = await connection.createChannel();
   await channel.assertExchange(exchanges.topic.key, exchanges.topic.type);
   await channel.assertQueue(queues.PROCESS);
   await channel.bindQueue(queues.PROCESS, exchanges.topic.key, events.SLIDE_CREATED);
   await channel.consume(queues.PROCESS, (message) => {
      console.log(message.fields.routingKey);
      if (message.fields.routingKey === events.SLIDE_CREATED) {
        const body = JSON.parse(message.content.toString()) || {};
        process(body);
      }
      channel.ack(message);
    });
  } catch (err) {
    console.log(err);
  }
};

app.listen(PORT, async () => {
  connection = await amqplib.connect(CONNECTION_URL);
  await listenEvents();
});