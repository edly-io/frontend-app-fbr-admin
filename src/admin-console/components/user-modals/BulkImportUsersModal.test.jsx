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

const chooseFile = () => {
  const csv = new File(['full_name\n'], 'users.csv', { type: 'text/csv' });
  fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [csv] } });
  return csv;
};

const uploadAndSubmit = () => {
  chooseFile();
  fireEvent.click(screen.getByRole('button', { name: 'Validate' }));
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

describe('BulkImportUsersModal city guidance', () => {
  const NO_CITY_ADMIN = { ...DATA_ADMIN, city: null };

  it('tells a Super Admin that each row needs an existing city', () => {
    renderModal(SUPER_ADMIN);

    expect(screen.getByText(/added to the city in each row's city column/i)).toBeInTheDocument();
  });

  it('does not show the Super Admin city hint to a city-locked admin', () => {
    renderModal(DATA_ADMIN);

    expect(screen.queryByText(/added to the city in each row's city column/i)).not.toBeInTheDocument();
  });

  it('warns an admin without a city and blocks validating and importing', () => {
    renderModal(NO_CITY_ADMIN);
    chooseFile();

    expect(screen.getByText(/your account has no city/i)).toBeInTheDocument();
    expect(screen.queryByText(CITY_NOTICE)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Validate' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Import users' })).toBeDisabled();
  });

  it('shows no city guidance before the caller profile is known', () => {
    renderModal({ roles: [], city: null, creatable_roles: ['instructor', 'trainee'] });

    expect(screen.queryByText(/your account has no city/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/added to the city in each row/i)).not.toBeInTheDocument();
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
  it('shows the accepted file type, size and row limits for the upload', () => {
    renderModal();

    expect(screen.getByText('.csv files only · Max 256 KB · Up to 200 rows')).toBeInTheDocument();
  });

  it('keeps the column list closed until asked for', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'Show columns (2 required, 2 optional)' }))
      .toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('bulk-import-required-columns')).not.toBeInTheDocument();
  });

  it('lists the selected role\'s columns, split into required and optional, once opened', () => {
    renderModal(SUPER_ADMIN);

    fireEvent.click(screen.getByRole('button', { name: /show columns/i }));

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
    fireEvent.click(screen.getByRole('button', { name: 'Show columns (2 required, 1 optional)' }));

    expect(screen.getByText('field_of_expertise')).toBeInTheDocument();
  });

  it('marks the city column as ignored for a city-locked admin', () => {
    renderModal(DATA_ADMIN);

    fireEvent.click(screen.getByRole('button', { name: /show columns/i }));

    expect(within(screen.getByTestId('bulk-import-optional-columns')).getByText('(ignored)'))
      .toBeInTheDocument();
  });

  it('does not mark the city column as ignored for a Super Admin', () => {
    renderModal(SUPER_ADMIN);

    fireEvent.click(screen.getByRole('button', { name: /show columns/i }));

    expect(screen.queryByText('(ignored)')).not.toBeInTheDocument();
  });

  it('hides the limits and columns when the format cannot be loaded', () => {
    useBulkImportFormat.mockReturnValue({ data: undefined });
    renderModal();

    expect(screen.queryByText(/files only/)).not.toBeInTheDocument();
    expect(screen.queryByText(/show columns/i)).not.toBeInTheDocument();
  });
});

describe('BulkImportUsersModal actions', () => {
  it('disables Validate and Import users until a file is chosen', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'Validate' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Import users' })).toBeDisabled();
  });

  it('validates the file without creating users', async () => {
    mutateAsync.mockResolvedValue({ dry_run: true, rows: [] });
    renderModal();
    const csv = chooseFile();

    fireEvent.click(screen.getByRole('button', { name: 'Validate' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ role: 'trainee', file: csv, dryRun: true }));
  });

  it('imports the file when asked to', async () => {
    mutateAsync.mockResolvedValue({ dry_run: false, rows: [] });
    renderModal();
    const csv = chooseFile();

    fireEvent.click(screen.getByRole('button', { name: 'Import users' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ role: 'trainee', file: csv, dryRun: false }));
  });

  it('labels a validation result as Validation', async () => {
    mutateAsync.mockResolvedValue({
      dry_run: true, total: 0, valid: 0, failed: 0, rows: [],
    });
    renderModal();

    uploadAndSubmit();

    expect(await screen.findByText('Validation')).toBeInTheDocument();
  });
});
