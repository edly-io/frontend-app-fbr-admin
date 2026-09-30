// Shared date-display formatting for the FBR Admin console. All user-facing
// date text should go through these helpers instead of calling
// `toLocaleDateString`/`toLocaleString`/`intl.formatDate` directly, so the app
// renders dates the way they are written in Pakistan - day first
// (DD/MM/YYYY) with a 12-hour clock - whatever the browser's locale. This only
// affects display - values sent to the backend/API keep whatever format they
// already use (e.g. ISO `YYYY-MM-DD`).
const pad = value => String(value).padStart(2, '0');

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// A bare `YYYY-MM-DD` is a calendar date, not an instant: `new Date()` would
// read it as UTC midnight and show the previous day west of UTC.
const toDate = (value) => {
  if (value instanceof Date) { return value; }
  if (typeof value === 'string' && DATE_ONLY.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

const toValidDate = (value) => {
  if (!value) { return null; }
  const date = toDate(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Unparseable input is shown as given rather than as "Invalid Date".
const fallback = value => (typeof value === 'string' ? value : '');

/** `21/09/2026` */
export const formatDate = (value) => {
  const date = toValidDate(value);
  if (!date) { return value ? fallback(value) : ''; }
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

/**
 * `26/12/2026` for a value that stands for a calendar day even when it arrives
 * as a timestamp - e.g. banner expiry, stored as end-of-day UTC, which read as
 * an instant would show the next day east of UTC. Only its date part is used.
 */
export const formatCalendarDate = value => formatDate(
  typeof value === 'string' ? value.split('T')[0] : value,
);

/** `4:33 PM`, or `4:33:30 PM` with `{ seconds: true }`. */
export const formatTime = (value, { seconds = false } = {}) => {
  const date = toValidDate(value);
  if (!date) { return value ? fallback(value) : ''; }
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', ...(seconds && { second: '2-digit' }),
  });
};

/** `21/09/2026, 4:33:30 PM`, or `21/09/2026, 4:33 PM` with `{ seconds: false }`. */
export const formatDateTime = (value, { seconds = true } = {}) => {
  const date = toValidDate(value);
  if (!date) { return value ? fallback(value) : ''; }
  return `${formatDate(date)}, ${formatTime(date, { seconds })}`;
};
