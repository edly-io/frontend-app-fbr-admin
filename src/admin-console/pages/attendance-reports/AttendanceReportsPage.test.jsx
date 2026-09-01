import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import AttendanceReportsPage from './AttendanceReportsPage';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('./data/api');

jest.mock('./data/apiHooks', () => ({
  useAttendanceReports: jest.fn(() => ({
    data: {
      rows: [], count: 0, kpis: { learners: 0, avgAttendance: 0, sessionsTracked: 0 },
    },
    isError: false,
    isFetching: false,
  })),
}));

jest.mock('../../data/apiHooks', () => ({
  useReportsAccess: () => ({
    capabilities: { canAccessAttendance: true },
    isLoading: false,
  }),
  useReportFilters: () => ({
    data: { programs: [], instructors: [], cities: [] },
    isError: false,
  }),
}));

// The table itself is covered by its own tests; here we only care which
// filter values the page hands it for the attendance details Sheet.
const tableProps = [];

jest.mock('./ReportDataTable', () => /* eslint-disable react/prop-types */ function MockReportDataTable(props) {
  tableProps.push(props);
  return <div data-testid="report-table" />;
});

jest.mock('../../components/breadcrumb/Breadcrumb', () => function MockBreadcrumb() { return <nav />; });

// ── Helpers ──────────────────────────────────────────────────────────────────

const renderPage = () => render(
  <IntlProvider locale="en">
    <AttendanceReportsPage />
  </IntlProvider>,
);

const lastTableProps = () => tableProps[tableProps.length - 1];

beforeEach(() => { tableProps.length = 0; });

afterEach(() => jest.clearAllMocks());

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AttendanceReportsPage date filters', () => {
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

  it('stops sending the range once the filters are cleared', () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-04-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));
    expect(lastTableProps()).toMatchObject({ startDate: '2026-04-01' });

    fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));

    expect(lastTableProps()).toMatchObject({ startDate: '', endDate: '' });
  });
});
