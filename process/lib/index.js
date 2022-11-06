// Common prive npm module which all micro services can use.

const events = {
  SLIDE_CREATED: 'SLIDE_CREATED',
  PROCESS_COMPLETED: 'PROCESS_COMPLETED',
  STORAGE_UPDATE: 'STORAGE_UPDATE',
  PROCESS_FAILED: 'PROCESS_FAILED',
  STORAGE_UPDATE_FAIL: 'STORAGE_UPDATE_FAIL',
};

const QUEUE_NAME = process.env.QUEUE_NAME || "SLIDE_PROCESSING";

// we can define event payload models/schemas here

module.exports = {
  events,
  QUEUE_NAME,
};