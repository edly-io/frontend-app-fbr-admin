// Shared date-display formatting for the FBR Admin console. All user-facing
// date text should go through these helpers instead of calling
// `toLocaleDateString`/`toLocaleString` directly, so the app renders dates in
// a single, consistent format (DD/MM/YYYY) everywhere. This only affects
// display - values sent to the backend/API keep whatever format they
// already use (e.g. ISO `YYYY-MM-DD`).
const pad = value => String(value).padStart(2, '0');

export const formatDate = (value) => {
  if (!value) { return ''; }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) { return value; }
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const formatDateTime = (value) => {
  if (!value) { return ''; }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) { return value; }
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', second: '2-digit',
  });
  return `${formatDate(value)}, ${time}`;
};
