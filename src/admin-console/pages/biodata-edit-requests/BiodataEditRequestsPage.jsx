import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Dropdown, Toast } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useBiodataEditRequests, useResolveEditRequest } from './data/apiHooks';
import BiodataEditRequestsToolbar from './BiodataEditRequestsToolbar';
import BiodataEditRequestsTable from './BiodataEditRequestsTable';
import AuditLogTable from '../../../shared/AuditLogTable';
import messages from './messages';
import './biodata-edit-requests-styles.scss';

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
  const [searchParams, setSearchParams] = useSearchParams();

  const activeView = searchParams.get('view') || 'list';
  const recordFilter = searchParams.get('record_id') || undefined;
  const handleViewChange = (view) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', view);
    if (view !== 'audit-log') { next.delete('record_id'); }
    setSearchParams(next);
  };
  const handleClearFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('record_id');
    setSearchParams(next);
  };
  const handleAuditHistory = (requestId) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', 'audit-log');
    next.set('record_id', String(requestId));
    setSearchParams(next);
  };
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
    <div className="biodata-edit-requests-page">
      <div className="page-view-toggle">
        {['list', 'audit-log'].map(view => (
          <button
            key={view}
            type="button"
            onClick={() => handleViewChange(view)}
            className={`page-view-toggle__tab${activeView === view ? ' page-view-toggle__tab--active' : ''}`}
          >
            {view === 'list' ? 'Edit Requests' : 'Audit Log'}
          </button>
        ))}
      </div>

      {activeView === 'audit-log' ? (
        <AuditLogTable
          appLabel="biodata"
          models={['biodataeditrequest']}
          recordFilter={recordFilter}
          onClearFilter={handleClearFilter}
        />
      ) : (
        <>
          <BiodataEditRequestsToolbar onRefresh={() => refetch()} />

          <div className="biodata-edit-requests-page__filter-row">
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                id="edit-request-status-filter"
                className="biodata-edit-requests-page__filter-toggle"
              >
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
            <span className="biodata-edit-requests-page__count">
              {intl.formatMessage(messages.requestsCount, { count: totalRequests })}
            </span>
          </div>

          {errorMessage && <Alert variant="danger" className="mb-3">{errorMessage}</Alert>}

          <BiodataEditRequestsTable
            isLoading={isLoading}
            requests={requests}
            adminNotes={adminNotes}
            onAdminNoteChange={handleAdminNoteChange}
            resolvingId={resolveMutation.isPending ? resolveMutation.variables?.requestId : null}
            onResolve={handleResolve}
            onAuditHistory={handleAuditHistory}
            page={page}
            totalPages={totalPages}
            start={start}
            end={end}
            total={totalRequests}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(value) => { setRowsPerPage(value); setCurrentPage(1); }}
          />
        </>
      )}

      <Toast show={showToast} onClose={() => setShowToast(false)}>
        {toastMessage}
      </Toast>
    </div>
  );
};

export default BiodataEditRequestsPage;
