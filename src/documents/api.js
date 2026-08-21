import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getBaseUrl = () => `${getConfig().LMS_BASE_URL}/fbr/documents/api/v1`;

export const listDocumentTypes = () => getAuthenticatedHttpClient().get(`${getBaseUrl()}/types/`);

export const createDocumentType = (name) => getAuthenticatedHttpClient().post(`${getBaseUrl()}/types/`, { name });

export const deleteDocumentType = (id) => getAuthenticatedHttpClient().delete(`${getBaseUrl()}/types/${id}/`);

export const listDocuments = ({ search = '', documentType = '', page = 1 } = {}) => {
  const params = new URLSearchParams();
  if (search) { params.set('search', search); }
  if (documentType) { params.set('document_type', documentType); }
  params.set('page', page);
  return getAuthenticatedHttpClient().get(`${getBaseUrl()}/documents/?${params.toString()}`);
};

export const uploadDocument = (formData) => getAuthenticatedHttpClient().post(`${getBaseUrl()}/documents/`, formData);

export const updateDocument = (id, payload) => getAuthenticatedHttpClient().patch(`${getBaseUrl()}/documents/${id}/`, payload);

export const deleteDocument = (id) => getAuthenticatedHttpClient().delete(`${getBaseUrl()}/documents/${id}/`);
