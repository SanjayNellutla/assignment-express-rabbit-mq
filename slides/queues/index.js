const getQueueChannel = async (connection) => {
  const channel = await connection.createChannel();
  return channel;
};

module.exports = {
  getQueueChannel,
};