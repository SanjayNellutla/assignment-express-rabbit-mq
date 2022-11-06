// Common prive npm module which all micro services can use.

const CONNECTION = 'amqp://localhost:5672';

const events = {
  SLIDE_CREATED: 'SLIDE_CREATED',
  PROCESS_COMPLETED: 'PROCESS_COMPLETED',
  PROCESS_FAILED: 'PROCESS_FAILED',
  STORAGE_UPDATE: 'STORAGE_UPDATE',
  STORAGE_UPDATE_FAIL: 'STORAGE_UPDATE_FAIL',
};

const queues = {
  PROCESS: 'PROCESS',
  SLIDES: 'SLIDES',
  USERS: 'USERS',
}

// const QUEUE_NAME = process.env.QUEUE_NAME || "SLIDE_PROCESSING";

// we can define event payload models/schemas here

module.exports = {
  events,
  CONNECTION,
  queues,
};