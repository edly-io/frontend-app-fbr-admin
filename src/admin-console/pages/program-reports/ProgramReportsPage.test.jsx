import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import ProgramReportsPage from './ProgramReportsPage';
import { useProgramReports } from './data/apiHooks';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('./data/api');

jest.mock('./data/apiHooks', () => ({
  useProgramReports: jest.fn(() => ({
    data: { rows: [], count: 0, kpis: { programCount: 0, certificatesAwarded: 0 } },
    isError: false,
    isFetching: false,
  })),
}));

jest.mock('../../data/apiHooks', () => ({
  useReportsAccess: () => ({
    capabilities: { canAccessPrograms: true },
    isLoading: false,
  }),
  useReportFilters: () => ({
    data: { programs: [], instructors: [], cities: [] },
    isError: false,
  }),
}));

jest.mock('./ReportDataTable', () => function MockReportDataTable() {
  return <div data-testid="report-table" />;
});

jest.mock('../../components/breadcrumb/Breadcrumb', () => function MockBreadcrumb() { return <nav />; });

// ── Helpers ──────────────────────────────────────────────────────────────────

const renderPage = () => render(
  <IntlProvider locale="en">
    <ProgramReportsPage />
  </IntlProvider>,
);

/** An ISO date *n* days from now, so the fixtures never age into the past. */
const isoDaysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const startInput = () => screen.getByLabelText('Start date');
const endInput = () => screen.getByLabelText('End date');

const pickRange = (start, end) => {
  fireEvent.change(startInput(), { target: { value: start } });
  fireEvent.change(endInput(), { target: { value: end } });
};

/** The filters the listing query last ran with. */
const lastQueriedFilters = () => {
  const { calls } = useProgramReports.mock;
  return calls[calls.length - 1][0];
};

const apply = () => fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

afterEach(() => jest.clearAllMocks());

// ── Unbounded selection ──────────────────────────────────────────────────────

describe('ProgramReportsPage date range is unbounded', () => {
  it('puts no min or max on either date input', () => {
    renderPage();

    // Programs are scheduled ahead and the report lists future ones, and either
    // pick order is legitimate - any bound here would hide valid selections.
    expect(startInput()).not.toHaveAttribute('max');
    expect(endInput()).not.toHaveAttribute('max');
    expect(startInput()).not.toHaveAttribute('min');
    expect(endInput()).not.toHaveAttribute('min');
  });

  it('keeps no min on the end input after a start date is picked', () => {
    renderPage();

    fireEvent.change(startInput(), { target: { value: '2026-09-20' } });

    expect(endInput()).not.toHaveAttribute('min');
  });

  it.each([
    ['a past range', '2025-01-01', '2025-03-31'],
    ['today on both sides', isoDaysFromNow(0), isoDaysFromNow(0)],
    ['a future range', isoDaysFromNow(30), isoDaysFromNow(365)],
    ['an end date before the start date', '2026-09-20', '2026-09-10'],
    ['an end date after the start date', '2026-09-10', '2026-09-20'],
    ['the same date on both sides', '2026-09-15', '2026-09-15'],
  ])('keeps %s exactly as picked', (_label, start, end) => {
    renderPage();

    pickRange(start, end);

    expect(startInput()).toHaveValue(start);
    expect(endInput()).toHaveValue(end);
  });
});

// ── What reaches the query ───────────────────────────────────────────────────

describe('ProgramReportsPage date range reaches the query', () => {
  it('sends a future range once applied', () => {
    renderPage();
    const start = isoDaysFromNow(30);
    const end = isoDaysFromNow(365);

    pickRange(start, end);
    apply();

    expect(lastQueriedFilters()).toMatchObject({ startDate: start, endDate: end });
  });

  it('sends a reversed range as picked, for the request layer to order', () => {
    renderPage();

    pickRange('2026-09-20', '2026-09-10');
    apply();

    expect(lastQueriedFilters()).toMatchObject({
      startDate: '2026-09-20',
      endDate: '2026-09-10',
    });
  });

  it('does not send the range before Apply', () => {
    renderPage();

    pickRange(isoDaysFromNow(30), isoDaysFromNow(60));

    expect(lastQueriedFilters()).toMatchObject({ startDate: '', endDate: '' });
  });

  it('clears the range back to unfiltered', () => {
    renderPage();

    pickRange('2026-09-10', '2026-09-20');
    apply();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));

    expect(startInput()).toHaveValue('');
    expect(endInput()).toHaveValue('');
    expect(lastQueriedFilters()).toMatchObject({ startDate: '', endDate: '' });
  });
});
