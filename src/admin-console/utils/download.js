export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getFilenameFromContentDisposition = (contentDisposition, fallback) => {
  if (!contentDisposition) { return fallback; }
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition);
  return match?.[1] ? decodeURIComponent(match[1]) : fallback;
};
