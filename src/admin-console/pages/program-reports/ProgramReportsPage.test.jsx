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

const lastQueriedFilters = () => {
  const { calls } = useProgramReports.mock;
  return calls[calls.length - 1][0];
};

const apply = () => fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

afterEach(() => jest.clearAllMocks());

// ── No upper bound ───────────────────────────────────────────────────────────

describe('ProgramReportsPage date range has no upper bound', () => {
  it('puts no max on either date input', () => {
    renderPage();

    expect(startInput()).not.toHaveAttribute('max');
    expect(endInput()).not.toHaveAttribute('max');
  });

  it.each([
    ['a past range', '2025-01-01', '2025-03-31'],
    ['today on both sides', isoDaysFromNow(0), isoDaysFromNow(0)],
    ['a future range', isoDaysFromNow(30), isoDaysFromNow(365)],
    ['an end date after the start date', '2026-09-10', '2026-09-20'],
    ['the same date on both sides', '2026-09-15', '2026-09-15'],
  ])('keeps %s exactly as picked', (_label, start, end) => {
    renderPage();

    pickRange(start, end);

    expect(startInput()).toHaveValue(start);
    expect(endInput()).toHaveValue(end);
  });
});

// ── The end date can't precede the start date ────────────────────────────────

describe('ProgramReportsPage date range keeps its ends in order', () => {
  it('bounds the end input at the start date once one is picked', () => {
    renderPage();

    expect(endInput()).not.toHaveAttribute('min');

    fireEvent.change(startInput(), { target: { value: '2026-09-20' } });

    expect(endInput()).toHaveAttribute('min', '2026-09-20');
  });

  it('pulls an end date typed before the start date up to it', () => {
    renderPage();

    pickRange('2026-09-20', '2026-09-10');

    expect(startInput()).toHaveValue('2026-09-20');
    expect(endInput()).toHaveValue('2026-09-20');
  });

  it('carries the end date along when the start date moves past it', () => {
    renderPage();

    pickRange('2026-09-10', '2026-09-20');
    fireEvent.change(startInput(), { target: { value: '2026-09-25' } });

    expect(endInput()).toHaveValue('2026-09-25');
  });

  it('leaves an end date on or after the start date alone', () => {
    renderPage();

    pickRange('2026-09-10', '2026-09-10');
    expect(endInput()).toHaveValue('2026-09-10');

    fireEvent.change(endInput(), { target: { value: '2026-09-20' } });

    expect(endInput()).toHaveValue('2026-09-20');
  });

  it('accepts an end date with no start date picked', () => {
    renderPage();

    fireEvent.change(endInput(), { target: { value: '2026-09-10' } });

    expect(endInput()).toHaveValue('2026-09-10');
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

  it('never sends an end date before the start date', () => {
    renderPage();

    pickRange('2026-09-20', '2026-09-10');
    apply();

    expect(lastQueriedFilters()).toMatchObject({
      startDate: '2026-09-20',
      endDate: '2026-09-20',
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
