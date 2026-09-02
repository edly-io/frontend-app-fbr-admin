import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import SessionsInstructorReportsPage from './SessionsInstructorReportsPage';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('./data/api');

jest.mock('./data/apiHooks', () => ({
  useSessionsInstructorReports: jest.fn(() => ({
    data: { rows: [], count: 0, kpis: { instructors: 0, sessions: 0, hours: 0 } },
    isError: false,
    isFetching: false,
  })),
}));

jest.mock('../../data/apiHooks', () => ({
  useReportsAccess: () => ({
    capabilities: { canAccessSessions: true },
    isLoading: false,
  }),
  useReportFilters: () => ({
    data: { programs: [], instructors: [], cities: [] },
    isError: false,
  }),
}));

// The table itself is covered by its own tests; here we only care which
// filter values the page hands it for the session details Sheet.
const tableProps = [];

jest.mock('./ReportDataTable', () => /* eslint-disable react/prop-types */ function MockReportDataTable(props) {
  tableProps.push(props);
  return <div data-testid="report-table" />;
});

jest.mock('../../components/breadcrumb/Breadcrumb', () => function MockBreadcrumb() { return <nav />; });

// ── Helpers ──────────────────────────────────────────────────────────────────

const renderPage = () => render(
  <IntlProvider locale="en">
    <SessionsInstructorReportsPage />
  </IntlProvider>,
);

const lastTableProps = () => tableProps[tableProps.length - 1];

beforeEach(() => { tableProps.length = 0; });

afterEach(() => jest.clearAllMocks());

// ── Tests ────────────────────────────────────────────────────────────────────

describe('SessionsInstructorReportsPage date filters', () => {
  it('hands the table the applied date range, not the draft one', () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-04-01' } });
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-06-30' } });

    // Draft only: nothing has been applied yet.
    expect(lastTableProps()).toMatchObject({ startDate: '', endDate: '' });

    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

    expect(lastTableProps()).toMatchObject({
      startDate: '2026-04-01',
      endDate: '2026-06-30',
    });
  });

  it('clears the range it hands the table', () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-04-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));

    expect(lastTableProps()).toMatchObject({ startDate: '', endDate: '' });
  });
});

describe('SessionsInstructorReportsPage CSV export button', () => {
  // The responsive pass sized this button down so it fits the filter bar on a
  // phone, and the export work gated it on a chosen Program or Instructor. Both
  // live on the same element, so it is worth pinning that neither was lost.
  it('is small and starts gated on a Program or Instructor filter', () => {
    renderPage();

    const downloadButton = screen.getByRole('button', { name: 'Download CSV' });

    expect(downloadButton).toBeDisabled();
    expect(downloadButton.className).toContain('btn-sm');
  });
});
