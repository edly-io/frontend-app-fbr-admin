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
  id: '42-p1',
  instructorId: '42',
  instructor: 'Sara Khan',
  programKey: 'program-v1:FBR+DST+2025-B',
  program: 'Anti-Money Laundering',
  sessions: 3,
  hours: 4.5,
  hoursByType: [{ sessionType: 'session', label: 'Session', hours: 4.5 }],
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
  fireEvent.click(screen.getByRole('button', { name: /view 3 sessions for sara khan/i }));
};

beforeEach(() => {
  api.getInstructorSessionDetails.mockResolvedValue({
    instructor: 'Sara Khan', program: 'Anti-Money Laundering', courses: [],
  });
});

afterEach(() => jest.clearAllMocks());

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ReportDataTable session details sheet', () => {
  it('requests the details with the applied date range', async () => {
    renderTable({ startDate: '2026-04-01', endDate: '2026-06-30' });

    openSheet();

    await waitFor(() => expect(api.getInstructorSessionDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        instructorId: '42',
        programKey: 'program-v1:FBR+DST+2025-B',
        startDate: '2026-04-01',
        endDate: '2026-06-30',
      }),
    ));
  });

  it('requests the details without a range when no dates are applied', async () => {
    renderTable();

    openSheet();

    await waitFor(() => expect(api.getInstructorSessionDetails).toHaveBeenCalledWith(
      expect.objectContaining({ instructorId: '42', startDate: '', endDate: '' }),
    ));
  });
});
