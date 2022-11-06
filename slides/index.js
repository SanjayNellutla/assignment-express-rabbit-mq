const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const amqplib = require('amqplib');
const { events, queues } = require("./lib");
let connection = null;
// const processService = require("./services/process");

app.use(bodyParser.json()) 

const handleCreate = async ({ req, res }) => {
  const { body } = req;
  try {
    const channel = await connection.createChannel();
    await channel.sendToQueue(queues.PROCESS, Buffer.from(JSON.stringify({
      event: events.SLIDE_CREATED,
      body: {
        ...body,
        uuid: Math.random() * 7,
      },
    })));
    console.log(1, 'slide record created');
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
    await channel.consume(queues.SLIDES, (message) => {
      // console.log('slides: Lisenting event');
      const { event } = JSON.parse(message.content.toString()) || {};
      if (event === events.STORAGE_UPDATE) {
        console.log(5, "Update slide data after process completion");
        channel.ack(message);
      } else if (event === events.STORAGE_UPDATE_FAIL) {
        // console.log(4, "Update slide data after process failure");
        // channel.ack(message);
      }
    });
    return true;
  } catch (err) {
    console.log(err);
  }
};

app.listen(3000, async () => {
  try {
    connection = await amqplib.connect('amqp://localhost:5672');
    listenEvents();
    initRoutes();
  } catch (err) {
    console.log(err);
  }
});