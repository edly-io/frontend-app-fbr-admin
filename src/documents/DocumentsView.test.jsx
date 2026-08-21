import React from 'react';
import {
  render, screen, fireEvent, waitFor, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import DocumentsView from './DocumentsView';
import * as api from './api';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('./api');

jest.mock(
  '../admin-console/components/debounced-search-input/DebouncedSearchInput',
  () => /* eslint-disable react/prop-types */ function MockSearch({ onChange, placeholder }) {
    return (
      <input
        data-testid="search-input"
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    );
  },
);

// ── Helpers ──────────────────────────────────────────────────────────────────

const renderView = () => render(
  <IntlProvider locale="en">
    <DocumentsView />
  </IntlProvider>,
);

const mockTypes = [
  { id: 'type-1', name: 'Policy' },
  { id: 'type-2', name: 'Report' },
];

const makeDoc = (overrides = {}) => ({
  id: 'doc-1',
  title: 'Annual Budget',
  original_filename: 'annual_budget.pdf',
  document_type: 'type-2',
  document_type_name: 'Report',
  file_size: 204800,
  content_type: 'application/pdf',
  uploaded_by_name: 'Sara Khan',
  created: '2026-08-20T10:00:00Z',
  ...overrides,
});

const pageOf = (docs) => ({
  count: docs.length,
  num_pages: 1,
  current_page: 1,
  results: docs,
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('DocumentsView', () => {
  beforeEach(() => {
    api.listDocumentTypes.mockResolvedValue({ data: mockTypes });
    api.listDocuments.mockResolvedValue({ data: pageOf([makeDoc()]) });
    api.deleteDocument.mockResolvedValue({});
  });

  afterEach(() => jest.clearAllMocks());

  // --- initial render ---

  it('renders page heading', async () => {
    renderView();
    // Use role query to avoid matching the breadcrumb span
    expect(screen.getByRole('heading', { name: 'Documents' })).toBeInTheDocument();
  });

  it('renders document title after loading', async () => {
    renderView();
    expect(await screen.findByText('Annual Budget')).toBeInTheDocument();
  });

  it('renders original filename below title when different', async () => {
    renderView();
    expect(await screen.findByText('annual_budget.pdf')).toBeInTheDocument();
  });

  it('renders document type badge', async () => {
    renderView();
    await screen.findByText('Annual Budget');
    // Badge is a <span> — target it specifically to avoid the <option> in the dropdown
    const badge = document.querySelector('.docs-type-badge');
    expect(badge).toHaveTextContent('Report');
  });

  it('renders uploader name', async () => {
    renderView();
    expect(await screen.findByText('Sara Khan')).toBeInTheDocument();
  });

  it('renders formatted file size', async () => {
    renderView();
    expect(await screen.findByText('200.0 KB')).toBeInTheDocument();
  });

  it('shows empty state when no documents returned', async () => {
    api.listDocuments.mockResolvedValue({ data: pageOf([]) });
    renderView();
    expect(await screen.findByText('No documents found.')).toBeInTheDocument();
  });

  it('shows document count in toolbar', async () => {
    renderView();
    expect(await screen.findByText('1 document')).toBeInTheDocument();
  });

  // --- type filter dropdown ---

  it('populates type filter with fetched types', async () => {
    renderView();
    await screen.findByText('Annual Budget');
    const select = screen.getByRole('combobox');
    expect(within(select).getByText('Policy')).toBeInTheDocument();
    expect(within(select).getByText('Report')).toBeInTheDocument();
  });

  it('refetches when type filter changes', async () => {
    renderView();
    await screen.findByText('Annual Budget');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'type-1' } });
    await waitFor(() => expect(api.listDocuments).toHaveBeenCalledTimes(2));
  });

  // --- delete flow ---

  it('shows delete confirmation modal when trash icon clicked', async () => {
    renderView();
    await screen.findByText('Annual Budget');
    fireEvent.click(screen.getByLabelText('Delete document'));
    expect(await screen.findByText('Delete Document')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
  });

  it('closes delete modal when Cancel clicked', async () => {
    renderView();
    await screen.findByText('Annual Budget');
    fireEvent.click(screen.getByLabelText('Delete document'));
    await screen.findByText('Delete Document');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByText('Delete Document')).not.toBeInTheDocument());
  });

  it('calls deleteDocument and refreshes list on confirm', async () => {
    renderView();
    await screen.findByText('Annual Budget');
    fireEvent.click(screen.getByLabelText('Delete document'));
    await screen.findByText('Delete Document');
    // The danger Delete button is the last one with name "Delete"
    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/ });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    await waitFor(() => expect(api.deleteDocument).toHaveBeenCalledWith('doc-1'));
    await waitFor(() => expect(api.listDocuments).toHaveBeenCalledTimes(2));
  });

  // --- copy link ---

  it('shows copied toast when copy link button clicked (execCommand fallback)', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    document.execCommand = jest.fn();
    renderView();
    await screen.findByText('Annual Budget');
    fireEvent.click(screen.getByLabelText('Copy shareable link'));
    expect(await screen.findByText(/Link copied for "Annual Budget"/)).toBeInTheDocument();
  });

  // --- edit modal ---

  it('opens edit modal when edit icon clicked', async () => {
    renderView();
    await screen.findByText('Annual Budget');
    fireEvent.click(screen.getByLabelText('Edit document'));
    expect(await screen.findByText('Edit Document')).toBeInTheDocument();
  });

  // --- upload modal ---

  it('opens upload modal when Upload Document button clicked', async () => {
    renderView();
    await screen.findByText('Annual Budget');
    fireEvent.click(screen.getByText('Upload Document'));
    // Modal title appears in the Paragon ModalDialog header
    expect(await screen.findAllByText('Upload Document')).not.toHaveLength(0);
  });

  // --- preview ---

  it('opens preview link in new tab', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {});
    renderView();
    await screen.findByText('Annual Budget');
    fireEvent.click(screen.getByLabelText('Preview document'));
    expect(openSpy).toHaveBeenCalledWith(
      'http://lms.test/fbr/documents/doc-1/',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });
});
