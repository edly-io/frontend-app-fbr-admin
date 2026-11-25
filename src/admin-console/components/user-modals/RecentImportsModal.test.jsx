import React from 'react';
import {
  fireEvent, render, screen, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';

import { useBulkImportJobs } from '../../data/apiHooks';
import RecentImportsModal from './RecentImportsModal';

jest.mock('../../data/apiHooks', () => ({
  useBulkImportJobs: jest.fn(),
}));

const job = overrides => ({
  id: 7,
  role: 'trainee',
  status: 'completed',
  total_rows: 3,
  created_count: 2,
  failures: [{ row: 3, errors: { batch: ['Batch not found.'] } }],
  created_at: '2026-11-25T08:30:00Z',
  ...overrides,
});

const renderModal = () => render(
  <IntlProvider locale="en">
    <RecentImportsModal onClose={jest.fn()} />
  </IntlProvider>,
);

describe('RecentImportsModal', () => {
  it('lists each recent import with its type, outcome and how many users were created', () => {
    useBulkImportJobs.mockReturnValue({
      data: [
        job({
          id: 8, role: 'instructor', status: 'running', created_count: 0, failures: [],
        }),
        job(),
      ],
      isLoading: false,
    });

    renderModal();

    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getAllByRole('columnheader').map(cell => cell.textContent)).toEqual(
      ['Started', 'Type', 'Status', 'Users created', 'Details'],
    );
    expect(within(rows[1]).getByText('Instructors')).toBeInTheDocument();
    expect(within(rows[1]).getByText('In progress')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Trainees')).toBeInTheDocument();
    expect(within(rows[2]).getByText('2 of 3')).toBeInTheDocument();
  });

  it.each([
    [{ status: 'completed', created_count: 3, failures: [] }, 'All created'],
    [{ status: 'completed', created_count: 2 }, 'Partly created'],
    [{ status: 'completed', created_count: 0 }, 'None created'],
    [{ status: 'failed', created_count: 0, failures: [] }, 'Did not finish'],
  ])('labels a finished import by what happened to its users', (overrides, label) => {
    useBulkImportJobs.mockReturnValue({ data: [job(overrides)], isLoading: false });

    renderModal();

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('opens an import to show its failed rows, then goes back to the list', () => {
    useBulkImportJobs.mockReturnValue({ data: [job()], isLoading: false });
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'View' }));

    expect(screen.getByText('2 of 3 users created, 1 failed.')).toBeInTheDocument();
    expect(screen.getByText('batch: Batch not found.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to recent imports' }));

    expect(screen.getByText('Partly created')).toBeInTheDocument();
  });

  it('says when there are no imports yet', () => {
    useBulkImportJobs.mockReturnValue({ data: [], isLoading: false });

    renderModal();

    expect(screen.getByText('No imports yet.')).toBeInTheDocument();
  });
});
