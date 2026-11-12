import React from 'react';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';

import { useAdminConsoleBootstrap, useBulkImportUsersMutation } from '../../data/apiHooks';
import BulkImportUsersModal from './BulkImportUsersModal';

jest.mock('../../data/apiHooks', () => ({
  useAdminConsoleBootstrap: jest.fn(),
  useBulkImportUsersMutation: jest.fn(),
}));

jest.mock('../../data/api', () => ({
  downloadBulkImportSample: jest.fn(),
}));

const mutateAsync = jest.fn();
const DATA_ADMIN = { roles: ['data_admin'], city: { id: 3, name: 'Lahore' }, creatable_roles: ['instructor', 'trainee'] };
const SUPER_ADMIN = { roles: ['super_admin'], city: null, creatable_roles: ['instructor', 'trainee'] };
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
