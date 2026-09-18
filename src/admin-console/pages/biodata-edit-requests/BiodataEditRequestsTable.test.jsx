import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import BiodataEditRequestsTable from './BiodataEditRequestsTable';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('../../components/UserIdentity', () => /* eslint-disable react/prop-types */ function MockUserIdentity({ name }) {
  return <span>{name}</span>;
});

const PENDING = {
  id: 7,
  profile_id: 13,
  profile_name: 'Hamza Nawaz',
  message: 'sample edit request',
  status: 'pending',
  admin_note: '',
  resolved_by_name: null,
  resolved_at: null,
  created_at: '2026-09-17T10:32:46Z',
};

const RESOLVED = {
  ...PENDING,
  id: 5,
  profile_name: 'Junaid Baig',
  message: 'Service history entry is missing.',
  status: 'resolved',
  admin_note: 'Updated as requested.',
  resolved_by_name: 'Bilal Ahmed',
  resolved_at: '2026-07-10T14:08:11Z',
};

const onAdminNoteChange = jest.fn();
const onResolve = jest.fn();
const onAuditHistory = jest.fn();

const renderTable = (props = {}) => render(
  <IntlProvider locale="en">
    <BiodataEditRequestsTable
      isLoading={false}
      requests={[PENDING, RESOLVED]}
      adminNotes={{}}
      onAdminNoteChange={onAdminNoteChange}
      onResolve={onResolve}
      onAuditHistory={onAuditHistory}
      page={1}
      totalPages={1}
      start={1}
      end={2}
      total={2}
      rowsPerPage={10}
      onPageChange={jest.fn()}
      onRowsPerPageChange={jest.fn()}
      {...props}
    />
  </IntlProvider>,
);

afterEach(() => jest.clearAllMocks());

describe('BiodataEditRequestsTable', () => {
  it('renders a row per request', () => {
    renderTable();

    expect(screen.getByText('sample edit request')).toBeInTheDocument();
    expect(screen.getByText('Service history entry is missing.')).toBeInTheDocument();
    expect(screen.getByText('Hamza Nawaz')).toBeInTheDocument();
  });

  it('keeps the table in a horizontally scrollable wrapper', () => {
    const { container } = renderTable();

    const scroller = container.querySelector('.biodata-edit-requests-table__scroll');

    expect(scroller).toBeInTheDocument();
    expect(scroller.querySelector('table')).toBeInTheDocument();
  });

  it('reports a typed admin note against its request', () => {
    renderTable();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Looks fine' } });

    expect(onAdminNoteChange).toHaveBeenCalledWith(7, 'Looks fine');
  });

  it('resolves the pending request and disables the button while it runs', () => {
    const { rerender } = renderTable();

    fireEvent.click(screen.getByRole('button', { name: /resolve/i }));
    expect(onResolve).toHaveBeenCalledWith(7);

    rerender(
      <IntlProvider locale="en">
        <BiodataEditRequestsTable
          isLoading={false}
          requests={[PENDING]}
          adminNotes={{}}
          onAdminNoteChange={onAdminNoteChange}
          resolvingId={7}
          onResolve={onResolve}
          onAuditHistory={onAuditHistory}
          page={1}
          totalPages={1}
          start={1}
          end={1}
          total={1}
          rowsPerPage={10}
          onPageChange={jest.fn()}
          onRowsPerPageChange={jest.fn()}
        />
      </IntlProvider>,
    );

    expect(screen.getByRole('button', { name: /resolving/i })).toBeDisabled();
  });

  it('shows the stored note instead of an input once resolved', () => {
    renderTable({ requests: [RESOLVED] });

    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('Updated as requested.')).toBeInTheDocument();
  });

  it('opens the audit history for a request', () => {
    renderTable({ requests: [PENDING] });

    fireEvent.click(screen.getByRole('button', { name: /history/i }));

    expect(onAuditHistory).toHaveBeenCalledWith(7);
  });

  it('shows the empty state with no requests', () => {
    renderTable({ requests: [], total: 0 });

    expect(screen.getByText(/no .*request/i)).toBeInTheDocument();
  });
});
