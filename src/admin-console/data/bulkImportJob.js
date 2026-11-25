const ACTIVE_STATUSES = ['pending', 'running'];

/** Whether a bulk import job is still queued or running. */
const isBulkImportJobActive = job => Boolean(job) && ACTIVE_STATUSES.includes(job.status);

export default isBulkImportJobActive;
