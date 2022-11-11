const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const amqplib = require('amqplib');
const { events, queues, exchanges, getBufferFromObject, CONNECTION_URL, PORT } = require("./lib");
let connection = null;
// const processService = require("./services/process");

app.use(bodyParser.json()) 

const handleCreate = async ({ req, res }) => {
  const { body } = req;
  try {
    const channel = await connection.createChannel();
    await channel.assertExchange(exchanges.topic.key, exchanges.topic.type);
    await channel.publish(exchanges.topic.key, events.SLIDE_CREATED, getBufferFromObject(body));
    res.status(200).send(body)
  } catch (err) {
    console.log(err);
    res.status(500).send(err)
  }
}

const initRoutes = () => {
  app.post('/create', (req, res) => {
    handleCreate({req, res})
  })
};

const listenEvents = async () => {
  try {
    const channel = await connection.createChannel();
    await channel.assertExchange(exchanges.topic.key, exchanges.topic.type);
    await channel.assertQueue(queues.SLIDES);
    await channel.bindQueue(queues.SLIDES, exchanges.topic.key, events.PROCESS_STARTED);
    await channel.bindQueue(queues.SLIDES, exchanges.topic.key, events.PROCESS_FAILED);
    await channel.bindQueue(queues.SLIDES, exchanges.topic.key, events.STORAGE_UPDATE);
    await channel.bindQueue(queues.SLIDES, exchanges.topic.key, events.STORAGE_UPDATE_FAIL);
    await channel.consume(queues.SLIDES, (message) => {
      console.log(message.fields.routingKey);
      channel.ack(message);
    });
    return true;
  } catch (err) {
    console.log(err);
  }
};

app.listen(PORT, async () => {
  try {
    connection = await amqplib.connect(CONNECTION_URL);
    await listenEvents();
    initRoutes();
  } catch (err) {
    console.log(err);
  }
});