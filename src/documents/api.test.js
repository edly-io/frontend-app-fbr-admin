import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  listDocuments, listDocumentTypes, createDocumentType, deleteDocumentType,
  uploadDocument, updateDocument, deleteDocument,
} from './api';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('@edx/frontend-platform/auth');

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

beforeEach(() => {
  getAuthenticatedHttpClient.mockReturnValue({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  });
});

afterEach(() => jest.clearAllMocks());

const BASE = 'http://lms.test/fbr/documents/api/v1';

describe('listDocumentTypes', () => {
  it('GETs the types endpoint', () => {
    mockGet.mockResolvedValue({ data: [] });
    listDocumentTypes();
    expect(mockGet).toHaveBeenCalledWith(`${BASE}/types/`);
  });
});

describe('createDocumentType', () => {
  it('POSTs name to types endpoint', () => {
    mockPost.mockResolvedValue({ data: { id: '1', name: 'Policy' } });
    createDocumentType('Policy');
    expect(mockPost).toHaveBeenCalledWith(`${BASE}/types/`, { name: 'Policy' });
  });
});

describe('deleteDocumentType', () => {
  it('DELETEs by id', () => {
    mockDelete.mockResolvedValue({});
    deleteDocumentType('type-123');
    expect(mockDelete).toHaveBeenCalledWith(`${BASE}/types/type-123/`);
  });
});

describe('listDocuments', () => {
  it('GETs documents with only page when no filters', () => {
    mockGet.mockResolvedValue({ data: { count: 0, results: [] } });
    listDocuments();
    expect(mockGet).toHaveBeenCalledWith(`${BASE}/documents/?page=1`);
  });

  it('includes search param when provided', () => {
    mockGet.mockResolvedValue({ data: { count: 0, results: [] } });
    listDocuments({ search: 'policy' });
    const url = mockGet.mock.calls[0][0];
    expect(url).toContain('search=policy');
    expect(url).toContain('page=1');
  });

  it('includes document_type param when provided', () => {
    mockGet.mockResolvedValue({ data: { count: 0, results: [] } });
    listDocuments({ documentType: 'type-abc' });
    const url = mockGet.mock.calls[0][0];
    expect(url).toContain('document_type=type-abc');
  });

  it('passes correct page number', () => {
    mockGet.mockResolvedValue({ data: { count: 0, results: [] } });
    listDocuments({ page: 3 });
    expect(mockGet).toHaveBeenCalledWith(`${BASE}/documents/?page=3`);
  });

  it('omits empty search from URL', () => {
    mockGet.mockResolvedValue({ data: { count: 0, results: [] } });
    listDocuments({ search: '' });
    const url = mockGet.mock.calls[0][0];
    expect(url).not.toContain('search');
  });
});

describe('uploadDocument', () => {
  it('POSTs FormData to documents endpoint', () => {
    mockPost.mockResolvedValue({ data: { id: 'new-doc' } });
    const formData = new FormData();
    formData.append('title', 'Test');
    uploadDocument(formData);
    expect(mockPost).toHaveBeenCalledWith(`${BASE}/documents/`, formData);
  });
});

describe('updateDocument', () => {
  it('PATCHes the correct document', () => {
    mockPatch.mockResolvedValue({ data: {} });
    updateDocument('doc-123', { title: 'New Title' });
    expect(mockPatch).toHaveBeenCalledWith(`${BASE}/documents/doc-123/`, { title: 'New Title' });
  });
});

describe('deleteDocument', () => {
  it('DELETEs the correct document', () => {
    mockDelete.mockResolvedValue({});
    deleteDocument('doc-123');
    expect(mockDelete).toHaveBeenCalledWith(`${BASE}/documents/doc-123/`);
  });
});
