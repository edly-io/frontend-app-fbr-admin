import React from 'react';
import {
  fireEvent, render, screen, waitFor, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import ReportDataTable from './ReportDataTable';
import { exportProgramPeople, mapProgramRow } from './data/api';
import { downloadBlob } from '../../utils/download';

// Ships as untranspiled ESM, which Jest can't parse out of `node_modules`.
jest.mock('@edly-io/frontend-component-fbr', () => ({ UserIdentity: () => null }));

jest.mock('./data/apiHooks', () => ({
  useProgramPeople: () => ({ data: undefined, isFetching: false }),
  useProgramOverview: () => ({ data: undefined, isLoading: false, isError: false }),
  useTraineeProgress: () => ({ data: undefined, isLoading: false, isError: false }),
}));

jest.mock('./data/api', () => ({
  ...jest.requireActual('./data/api'),
  exportProgramPeople: jest.fn(),
}));

jest.mock('../../utils/download', () => ({ downloadBlob: jest.fn() }));

const LONG_DESCRIPTION = 'A twelve-month blended program covering safety, compliance and field '
  + 'operations, delivered across three cities with a final practical assessment.';

const apiRow = (overrides = {}) => ({
  program_key: 'prog-1',
  program_title: 'Field Operations',
  description: LONG_DESCRIPTION,
  program_city: 'Lahore',
  start_date: '2026-01-15',
  end_date: '2026-11-30',
  instructor_count: 3,
  trainee_count: 42,
  finalized: 12,
  avg_score: 78.5,
  program_status: 'active',
  certificates_awarded: 7,
  ...overrides,
});

const renderTable = (rows) => render(
  <IntlProvider locale="en">
    <ReportDataTable
      rows={rows}
      count={rows.length}
      pageSize={20}
      page={1}
      onPageChange={jest.fn()}
    />
  </IntlProvider>,
);

const headerNames = () => screen.getAllByRole('columnheader').map(header => header.textContent.trim());

const downloadButton = () => screen.getByRole('button', { name: /Download CSV report for/i });

beforeEach(() => {
  jest.clearAllMocks();
  exportProgramPeople.mockResolvedValue({
    blob: new Blob(['Program\r\n'], { type: 'text/csv' }),
    filename: 'field-operations-report.csv',
  });
});

describe('Program Reports table columns', () => {
  it('renders the expected columns and drops Finalized / Avg. Score', () => {
    renderTable([mapProgramRow(apiRow())]);

    expect(headerNames()).toEqual([
      'Program', 'Description', 'City', 'Start Date', 'End Date',
      'Instructors', 'Certificate', 'No. of Participants', 'Status', 'Action',
    ]);
    expect(screen.queryByText('Finalized')).not.toBeInTheDocument();
    expect(screen.queryByText('Avg. Score')).not.toBeInTheDocument();
    expect(screen.queryByText('78.5')).not.toBeInTheDocument();
  });

  it('formats the API start/end dates with the shared DD/MM/YYYY convention', () => {
    renderTable([mapProgramRow(apiRow())]);

    expect(screen.getByText('15/01/2026')).toBeInTheDocument();
    expect(screen.getByText('30/11/2026')).toBeInTheDocument();
  });

  it('keeps the existing Program, City, Instructors, Certificate, Enrolled and Status cells', () => {
    renderTable([mapProgramRow(apiRow())]);
    const row = screen.getAllByRole('row')[1];

    expect(within(row).getByText('Field Operations')).toBeInTheDocument();
    expect(within(row).getByText('Lahore')).toBeInTheDocument();
    expect(within(row).getByText('(3)')).toBeInTheDocument();
    expect(within(row).getByText('(7)')).toBeInTheDocument();
    expect(within(row).getByText('42')).toBeInTheDocument();
    expect(within(row).getByText('Active')).toBeInTheDocument();
  });
});

describe('Program description cell', () => {
  const descriptionTrigger = () => screen.getByRole('note');

  it('renders the description from the API in a truncated, keyboard-focusable trigger', () => {
    renderTable([mapProgramRow(apiRow())]);
    const trigger = descriptionTrigger();

    expect(trigger).toHaveTextContent(LONG_DESCRIPTION);
    expect(trigger).toHaveClass('report-description-cell');
    expect(trigger).toHaveAttribute('tabindex', '0');
    expect(trigger).toHaveAttribute('aria-label', `Field Operations description: ${LONG_DESCRIPTION}`);
  });

  it('shows the full description in a tooltip on hover', async () => {
    renderTable([mapProgramRow(apiRow())]);

    fireEvent.mouseOver(descriptionTrigger());

    await waitFor(() => {
      expect(within(screen.getByRole('tooltip')).getByText(LONG_DESCRIPTION)).toBeInTheDocument();
    });
  });

  it('shows the full description in a tooltip on keyboard focus', async () => {
    renderTable([mapProgramRow(apiRow())]);

    fireEvent.focus(descriptionTrigger());

    await waitFor(() => {
      expect(within(screen.getByRole('tooltip')).getByText(LONG_DESCRIPTION)).toBeInTheDocument();
    });
  });

  it.each([[null], [''], ['   ']])('renders a placeholder instead of a tooltip trigger for %p', (description) => {
    renderTable([mapProgramRow(apiRow({ description }))]);

    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders a placeholder when the API omits the start/end dates', () => {
    renderTable([mapProgramRow(apiRow({ start_date: null, end_date: null }))]);

    expect(screen.getAllByText('—')).toHaveLength(2);
  });
});

describe('Per-row CSV download', () => {
  it('asks the backend for the program’s summary sheet', async () => {
    renderTable([mapProgramRow(apiRow())]);
    fireEvent.click(downloadButton());

    await waitFor(() => expect(exportProgramPeople).toHaveBeenCalledWith('prog-1'));
  });

  it('hands the streamed blob to the browser under the backend’s filename', async () => {
    renderTable([mapProgramRow(apiRow())]);
    fireEvent.click(downloadButton());

    await waitFor(() => expect(downloadBlob).toHaveBeenCalledTimes(1));
    expect(downloadBlob.mock.calls[0][1]).toBe('field-operations-report.csv');
  });

  it('surfaces a failed download instead of failing silently', async () => {
    exportProgramPeople.mockRejectedValue(new Error('boom'));
    renderTable([mapProgramRow(apiRow())]);
    fireEvent.click(downloadButton());

    expect(await screen.findByText(/something went wrong while exporting/i)).toBeInTheDocument();
    expect(downloadBlob).not.toHaveBeenCalled();
  });
});
