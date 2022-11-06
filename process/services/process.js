const { events, QUEUE_NAME } = require("../lib");

const process = (slide, channel) => {
  const output = {
    event: events.PROCESS_COMPLETED,
    body: slide,
  }
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(output)));
  console.log(2, 'procesing done');
};

module.exports = {
  process,
};