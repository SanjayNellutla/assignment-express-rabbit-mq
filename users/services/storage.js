const { events,  QUEUE_NAME } = require("../lib");

const updateUserStorage = (slide, channel) => {
  // console.log(`User storage got updated`, slide);
  const output = {
    event: events.STORAGE_UPDATE,
    body: slide,
  }
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(output)));
  console.log(3, 'storage updated');
};

module.exports = {
  update: updateUserStorage,
};