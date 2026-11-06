/**
 * The message a failed API request carries, or `fallback` when it has none.
 * Handles DRF's shapes: a string, a list, `{ detail }`, `{ non_field_errors }`
 * and `{ field: [messages] }` (first field wins).
 */
export const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) { return fallback; }
  if (typeof data === 'string') { return data; }
  if (Array.isArray(data)) { return data.join(' '); }
  if (data.detail) { return Array.isArray(data.detail) ? data.detail.join(' ') : data.detail; }
  if (data.non_field_errors) { return Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : data.non_field_errors; }

  const firstError = Object.values(data)[0];
  if (Array.isArray(firstError)) { return firstError.join(' '); }
  if (typeof firstError === 'string') { return firstError; }
  return fallback;
};
