import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import DocumentModal from './DocumentModal';
import * as api from './api';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('./api');

jest.mock('./DocumentTypeSelect', () => /* eslint-disable react/prop-types */ function MockTypeSelect({
  inputId, onChange, value, isDisabled,
}) {
  return (
    <select
      id={inputId}
      data-testid="type-select"
      disabled={isDisabled}
      value={value?.value || ''}
      onChange={e => onChange(e.target.value ? { value: e.target.value, label: e.target.value } : null)}
    >
      <option value="">-- none --</option>
      <option value="type-1">Policy</option>
      <option value="type-2">Report</option>
    </select>
  );
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const onClose = jest.fn();
const onSaved = jest.fn();

const renderModal = (props = {}) => render(
  <IntlProvider locale="en">
    <DocumentModal onClose={onClose} onSaved={onSaved} {...props} />
  </IntlProvider>,
);

const existingDoc = {
  id: 'doc-1',
  title: 'HR Policy Manual',
  description: 'All HR policies',
  document_type: 'type-1',
  document_type_name: 'Policy',
};

const makeFile = (name = 'report.pdf', type = 'application/pdf') => new File(
  [new ArrayBuffer(1024)],
  name,
  { type },
);

// The hidden <input type="file"> is a sibling of the upload zone div.
// Paragon portal renders into document.body, so we query from there.
const getFileInput = () => document.querySelector('input[type="file"]');

// Submit the form directly since Paragon's footer button uses form= attribute
// which jsdom does not support for cross-element association.
const submitForm = () => {
  const form = document.getElementById('document-form');
  fireEvent.submit(form);
};

// ── Create mode ───────────────────────────────────────────────────────────────

describe('DocumentModal — create mode', () => {
  beforeEach(() => {
    api.uploadDocument.mockResolvedValue({ data: { id: 'new-doc', title: 'Test' } });
  });
  afterEach(() => jest.clearAllMocks());

  it('renders Upload Document heading', () => {
    renderModal();
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
  });

  it('renders title input', () => {
    renderModal();
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
  });

  it('renders file upload zone', () => {
    renderModal();
    expect(screen.getByText(/Click to upload/)).toBeInTheDocument();
  });

  it('renders description textarea', () => {
    renderModal();
    expect(screen.getByPlaceholderText(/Brief description/)).toBeInTheDocument();
  });

  it('shows error when submitted without title', async () => {
    renderModal();
    submitForm();
    expect(await screen.findByText('Title is required.')).toBeInTheDocument();
  });

  it('shows error when submitted without file', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'My Doc' } });
    submitForm();
    expect(await screen.findByText('Please select a file to upload.')).toBeInTheDocument();
  });

  it('shows error for unsupported file extension', async () => {
    renderModal();
    const input = getFileInput();
    const badFile = makeFile('script.exe', 'application/octet-stream');
    fireEvent.change(input, { target: { files: [badFile] } });
    expect(await screen.findByText(/not supported/)).toBeInTheDocument();
  });

  it('auto-fills title from filename when title is empty', async () => {
    renderModal();
    fireEvent.change(getFileInput(), { target: { files: [makeFile('annual-report.pdf')] } });
    await waitFor(() => {
      expect(screen.getByLabelText(/Title/)).toHaveValue('annual-report');
    });
  });

  it('shows selected filename after file is picked', async () => {
    renderModal();
    fireEvent.change(getFileInput(), { target: { files: [makeFile('report.pdf')] } });
    expect(await screen.findByText('report.pdf')).toBeInTheDocument();
  });

  it('calls uploadDocument and onSaved on successful submit', async () => {
    renderModal();
    fireEvent.change(getFileInput(), { target: { files: [makeFile('budget.pdf')] } });
    await screen.findByText('budget.pdf');
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'Budget Doc' } });
    submitForm();
    await waitFor(() => expect(api.uploadDocument).toHaveBeenCalled());
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('calls onClose when Cancel clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});

// ── Edit mode ─────────────────────────────────────────────────────────────────

describe('DocumentModal — edit mode', () => {
  beforeEach(() => {
    api.updateDocument.mockResolvedValue({ data: existingDoc });
  });
  afterEach(() => jest.clearAllMocks());

  it('renders Edit Document heading', () => {
    renderModal({ document: existingDoc });
    expect(screen.getByText('Edit Document')).toBeInTheDocument();
  });

  it('pre-fills title field', () => {
    renderModal({ document: existingDoc });
    expect(screen.getByDisplayValue('HR Policy Manual')).toBeInTheDocument();
  });

  it('pre-fills description field', () => {
    renderModal({ document: existingDoc });
    expect(screen.getByDisplayValue('All HR policies')).toBeInTheDocument();
  });

  it('does not show file upload zone', () => {
    renderModal({ document: existingDoc });
    expect(screen.queryByText(/Click to upload/)).not.toBeInTheDocument();
  });

  it('shows Save Changes button instead of Upload', () => {
    renderModal({ document: existingDoc });
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Upload' })).not.toBeInTheDocument();
  });

  it('shows error when title is cleared before saving', async () => {
    renderModal({ document: existingDoc });
    fireEvent.change(screen.getByDisplayValue('HR Policy Manual'), { target: { value: '' } });
    submitForm();
    expect(await screen.findByText('Title is required.')).toBeInTheDocument();
  });

  it('calls updateDocument with updated title on submit', async () => {
    renderModal({ document: existingDoc });
    fireEvent.change(screen.getByDisplayValue('HR Policy Manual'), {
      target: { value: 'Updated Policy Manual' },
    });
    submitForm();
    await waitFor(() => expect(api.updateDocument).toHaveBeenCalledWith(
      'doc-1',
      expect.objectContaining({ title: 'Updated Policy Manual' }),
    ));
  });

  it('calls onSaved after successful update', async () => {
    renderModal({ document: existingDoc });
    submitForm();
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('shows API error message on failure', async () => {
    api.updateDocument.mockRejectedValue({
      response: { data: { detail: 'Server error occurred.' } },
    });
    renderModal({ document: existingDoc });
    submitForm();
    expect(await screen.findByText('Server error occurred.')).toBeInTheDocument();
  });
});
