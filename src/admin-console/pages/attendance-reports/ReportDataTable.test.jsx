import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReportDataTable from './ReportDataTable';
import * as api from './data/api';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('./data/api');

jest.mock(
  '@edly-io/frontend-component-fbr',
  () => /* eslint-disable react/prop-types */ ({
    UserIdentity: function MockUserIdentity({ name }) { return <span>{name}</span>; },
  }),
);

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROW = {
  id: '67-p1',
  learnerId: '67',
  learner: 'Ali Raza',
  programKey: 'program-v1:FBR+STP+2026-B',
  program: 'Standard Training Programme',
  attended: 2,
  totalSessions: 3,
  attendancePercentage: 66.7,
  breakdown: {
    present: 2, absent: 1, leave: 0, pending: 0,
  },
};

const renderTable = (props = {}) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <IntlProvider locale="en">
      <QueryClientProvider client={client}>
        <ReportDataTable
          rows={[ROW]}
          count={1}
          pageSize={20}
          page={1}
          onPageChange={jest.fn()}
          {...props}
        />
      </QueryClientProvider>
    </IntlProvider>,
  );
};

const openSheet = () => {
  fireEvent.click(screen.getByRole('button', { name: /view 2 attended sessions for ali raza/i }));
};

beforeEach(() => {
  api.getAttendanceDetails.mockResolvedValue({
    learner: 'Ali Raza',
    program: 'Standard Training Programme',
    summary: {
      present: 0, absent: 0, leave: 0, pending: 0, total: 0, attendanceRate: 0,
    },
    courses: [],
  });
});

afterEach(() => jest.clearAllMocks());

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ReportDataTable attendance details sheet', () => {
  it('requests the details with the applied date range', async () => {
    renderTable({ startDate: '2026-04-01', endDate: '2026-06-30' });

    openSheet();

    await waitFor(() => expect(api.getAttendanceDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        learnerId: '67',
        programKey: 'program-v1:FBR+STP+2026-B',
        startDate: '2026-04-01',
        endDate: '2026-06-30',
      }),
    ));
  });

  it('requests the details without a range when no dates are applied', async () => {
    renderTable();

    openSheet();

    await waitFor(() => expect(api.getAttendanceDetails).toHaveBeenCalledWith(
      expect.objectContaining({ learnerId: '67', startDate: '', endDate: '' }),
    ));
  });
});
