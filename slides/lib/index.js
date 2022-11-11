// Common prive npm module which all micro services can use.

const CONNECTION_URL = process.env.MQ_URL || 'amqp://localhost:5672';

const PORT = process.env.PORT || 3000;

const events = {
  SLIDE_CREATED: 'SLIDE_CREATED',
  PROCESS_STARTED: 'PROCESS_STARTED',
  PROCESS_COMPLETED: 'PROCESS_COMPLETED',
  PROCESS_FAILED: 'PROCESS_FAILED',
  STORAGE_UPDATE: 'STORAGE_UPDATE',
  STORAGE_UPDATE_FAIL: 'STORAGE_UPDATE_FAIL',
};

const queues = {
  PROCESS: 'PROCESS',
  SLIDES: 'SLIDES',
  USERS: 'USERS',
};

const exchanges = {
  topic: { key: 'slide_processing', type: 'topic' },
  direct: { key: 'slide_processing', type: 'direct' }
};

const getBufferFromObject = (body) => {
  return Buffer.from(JSON.stringify(body));
};

// const QUEUE_NAME = process.env.QUEUE_NAME || "SLIDE_PROCESSING";

// we can define event payload models/schemas here

module.exports = {
  events,
  CONNECTION_URL,
  queues,
  exchanges,
  getBufferFromObject,
  PORT,
};