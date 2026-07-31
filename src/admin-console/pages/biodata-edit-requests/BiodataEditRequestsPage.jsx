import React, { useState } from 'react';
import { Dropdown, Toast } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useBiodataEditRequests, useResolveEditRequest } from './data/apiHooks';
import BiodataEditRequestsToolbar from './BiodataEditRequestsToolbar';
import BiodataEditRequestsTable from './BiodataEditRequestsTable';
import messages from './messages';

const ROWS_PER_PAGE = 10;

const STATUS_FILTER_MESSAGES = {
  pending: messages.statusPending,
  resolved: messages.statusResolved,
  all: messages.statusFilterAll,
};

const STATUS_FILTER_OPTIONS = ['pending', 'resolved', 'all'];

/**
 * Biodata Edit Requests page: status-filtered, paginated list of trainee
 * biodata edit requests with an inline admin-note textarea and resolve
 * action per pending row.
 */
const BiodataEditRequestsPage = () => {
  const intl = useIntl();

  const [statusFilter, setStatusFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const [adminNotes, setAdminNotes] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const {
    data, isLoading, isError, error, refetch,
  } = useBiodataEditRequests({ page: currentPage, pageSize: rowsPerPage, statusFilter });
  const resolveMutation = useResolveEditRequest();

  const requests = data?.requests ?? [];
  const totalRequests = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRequests / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const start = totalRequests === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min((page - 1) * rowsPerPage + requests.length, totalRequests);

  const showNotification = (message) => { setToastMessage(message); setShowToast(true); };

  const loadErrorMessage = isError
    ? (error?.response?.data?.detail || intl.formatMessage(messages.loadError))
    : '';
  const [resolveErrorMessage, setResolveErrorMessage] = useState('');
  const errorMessage = resolveErrorMessage || loadErrorMessage;

  const handleStatusFilterChange = (value) => { setStatusFilter(value); setCurrentPage(1); };
  const handleAdminNoteChange = (requestId, value) => {
    setAdminNotes(prev => ({ ...prev, [requestId]: value }));
  };

  const handleResolve = async (requestId) => {
    setResolveErrorMessage('');
    try {
      await resolveMutation.mutateAsync({ requestId, adminNote: adminNotes[requestId] || '' });
      setAdminNotes(prev => ({ ...prev, [requestId]: '' }));
      showNotification(intl.formatMessage(messages.resolvedToast));
    } catch (submitError) {
      const responseData = submitError?.response?.data;
      setResolveErrorMessage(
        responseData?.detail
        || responseData?.non_field_errors
        || intl.formatMessage(messages.resolveError),
      );
    }
  };

  return (
    <>
      <BiodataEditRequestsToolbar onRefresh={() => refetch()} />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
      }}
      >
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="edit-request-status-filter" style={{ fontSize: '13.5px' }}>
            {intl.formatMessage(messages.statusFilterLabel, {
              status: intl.formatMessage(STATUS_FILTER_MESSAGES[statusFilter]),
            })}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {STATUS_FILTER_OPTIONS.map(value => (
              <Dropdown.Item key={value} onClick={() => handleStatusFilterChange(value)}>
                {intl.formatMessage(STATUS_FILTER_MESSAGES[value])}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', fontWeight: 500 }}>
          {intl.formatMessage(messages.requestsCount, { count: totalRequests })}
        </span>
      </div>

      {errorMessage && (
        <div style={{
          background: '#FDE8E8', color: '#9B1C1C', border: '1px solid #F8B4B4', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '13.5px',
        }}
        >
          {errorMessage}
        </div>
      )}

      <BiodataEditRequestsTable
        isLoading={isLoading}
        requests={requests}
        adminNotes={adminNotes}
        onAdminNoteChange={handleAdminNoteChange}
        resolvingId={resolveMutation.isPending ? resolveMutation.variables?.requestId : null}
        onResolve={handleResolve}
        page={page}
        totalPages={totalPages}
        start={start}
        end={end}
        total={totalRequests}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value) => { setRowsPerPage(value); setCurrentPage(1); }}
      />

      <Toast show={showToast} onClose={() => setShowToast(false)}>
        {toastMessage}
      </Toast>
    </>
  );
};

export default BiodataEditRequestsPage;
