import React from 'react';
import {
  fireEvent, render, screen, waitFor, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';

import {
  useAdminConsoleBootstrap, useBulkImportFormat, useBulkImportUsersMutation,
} from '../../data/apiHooks';
import BulkImportUsersModal from './BulkImportUsersModal';

jest.mock('../../data/apiHooks', () => ({
  useAdminConsoleBootstrap: jest.fn(),
  useBulkImportFormat: jest.fn(),
  useBulkImportUsersMutation: jest.fn(),
}));

jest.mock('../../data/api', () => ({
  downloadBulkImportSample: jest.fn(),
}));

const mutateAsync = jest.fn();
const DATA_ADMIN = { roles: ['data_admin'], city: { id: 3, name: 'Lahore' }, creatable_roles: ['instructor', 'trainee'] };
const SUPER_ADMIN = { roles: ['super_admin'], city: null, creatable_roles: ['instructor', 'trainee'] };
const column = (name, required = false) => ({ name, required });
const IMPORT_FORMAT = {
  extension: '.csv',
  max_file_size_kb: 256,
  max_rows: 200,
  columns: {
    trainee: [column('full_name', true), column('email', true), column('cnic'), column('city')],
    instructor: [column('full_name', true), column('field_of_expertise', true), column('cnic')],
  },
};
const CITY_NOTICE = /all users will be added to lahore\. the city column in the file is ignored\./i;

const renderModal = (callerProfile = DATA_ADMIN) => {
  useAdminConsoleBootstrap.mockReturnValue({ data: { callerProfile } });
  return render(
    <IntlProvider locale="en">
      <BulkImportUsersModal onClose={jest.fn()} />
    </IntlProvider>,
  );
};

const uploadAndSubmit = () => {
  const csv = new File(['full_name\n'], 'users.csv', { type: 'text/csv' });
  fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [csv] } });
  fireEvent.click(screen.getByRole('button', { name: /run validation/i }));
};

beforeEach(() => {
  mutateAsync.mockReset();
  useBulkImportUsersMutation.mockReturnValue({ mutateAsync, isPending: false });
  useBulkImportFormat.mockReturnValue({ data: IMPORT_FORMAT });
});

describe('BulkImportUsersModal city notice', () => {
  it('tells a city-locked admin that every user goes to their city', () => {
    renderModal(DATA_ADMIN);

    expect(screen.getByText(CITY_NOTICE)).toBeInTheDocument();
  });

  it('shows no city notice to a Super Admin', () => {
    renderModal(SUPER_ADMIN);

    expect(screen.queryByText(/the city column in the file is ignored/i)).not.toBeInTheDocument();
  });
});

describe('BulkImportUsersModal results', () => {
  it('shows the city each row will be created in', async () => {
    mutateAsync.mockResolvedValue({
      role: 'trainee',
      dry_run: true,
      total: 1,
      valid: 1,
      failed: 0,
      rows: [{
        row: 2, email: 'ali@example.com', city: 'Karachi', status: 'valid', errors: {},
      }],
    });
    renderModal(SUPER_ADMIN);

    uploadAndSubmit();

    expect(await screen.findByRole('columnheader', { name: /city/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Karachi' })).toBeInTheDocument();
  });

  it('shows the server message when the file is rejected', async () => {
    const message = 'Unexpected columns: salary. Download the sample template to see the expected columns.';
    mutateAsync.mockRejectedValue({ response: { status: 400, data: { file: [message] } } });
    renderModal(SUPER_ADMIN);

    uploadAndSubmit();

    await waitFor(() => expect(screen.getByText(message)).toBeInTheDocument());
  });
});

describe('BulkImportUsersModal import format', () => {
  it('shows the accepted file type, size and row limits under the file input', () => {
    renderModal();

    expect(screen.getByText('.csv files only · Max 256 KB · Up to 200 rows')).toBeInTheDocument();
  });

  it('lists the selected role\'s columns, split into required and optional, once opened', () => {
    renderModal();

    fireEvent.click(screen.getByText('View CSV columns (4)'));

    const required = screen.getByTestId('bulk-import-required-columns');
    const optional = screen.getByTestId('bulk-import-optional-columns');
    expect(within(required).getByText('full_name')).toBeInTheDocument();
    expect(within(required).getByText('email')).toBeInTheDocument();
    expect(within(optional).getByText('cnic')).toBeInTheDocument();
    expect(within(optional).getByText('city')).toBeInTheDocument();
  });

  it('switches the column list with the import type', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /instructors/i }));
    fireEvent.click(screen.getByText('View CSV columns (3)'));

    expect(screen.getByText('field_of_expertise')).toBeInTheDocument();
  });

  it('hides the limits and columns when the format cannot be loaded', () => {
    useBulkImportFormat.mockReturnValue({ data: undefined });
    renderModal();

    expect(screen.queryByText(/files only/)).not.toBeInTheDocument();
    expect(screen.queryByText(/view csv columns/i)).not.toBeInTheDocument();
  });
});
