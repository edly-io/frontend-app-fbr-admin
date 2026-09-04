import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Toast } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSignupApprovals } from './data/apiHooks';
import SignupApprovalsToolbar from './SignupApprovalsToolbar';
import SignupApprovalsList from './SignupApprovalsList';
import AddUserModal from '../../components/user-modals/AddUserModal';
import DebouncedSearchInput from '../../components/debounced-search-input/DebouncedSearchInput';
import AuditLogTable from '../../../shared/AuditLogTable';
import messages from './messages';
import './signup-approvals-styles.scss';

const ROWS_PER_PAGE = 10;

/**
 * Signup Approvals page: search + paginated list of pending sign-ups, each
 * assignable a role via the shared Add User modal (in "assignment" mode).
 * Renders its own `AddUserModal` instance since this page is now routed
 * independently from Users (the monolith shared a single modal instance
 * across both views).
 */
const SignupApprovalsPage = () => {
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
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const [assignmentUser, setAssignmentUser] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const {
    data, isLoading, isError, error, refetch,
  } = useSignupApprovals({ page: currentPage, pageSize: rowsPerPage, search });

  const approvals = data?.approvals ?? [];
  const totalApprovals = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalApprovals / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const start = totalApprovals === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min((page - 1) * rowsPerPage + approvals.length, totalApprovals);

  const errorMessage = isError
    ? (error?.response?.data?.detail || intl.formatMessage(messages.loadError))
    : '';

  const showNotification = (message) => { setToastMessage(message); setShowToast(true); };

  const handleRefresh = () => {
    setCurrentPage(1);
    refetch();
    showNotification(intl.formatMessage(messages.refreshedToast));
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleAssign = (user) => { setAssignmentUser(user); };
  const handleModalClose = () => { setAssignmentUser(null); };

  return (
    <div className="signup-approvals-page">
      <div className="page-view-toggle">
        {['list', 'audit-log'].map(view => (
          <button
            key={view}
            type="button"
            onClick={() => handleViewChange(view)}
            className={`page-view-toggle__tab${activeView === view ? ' page-view-toggle__tab--active' : ''}`}
          >
            {view === 'list' ? 'Signup Approvals' : 'Audit Log'}
          </button>
        ))}
      </div>

      {activeView === 'audit-log' ? (
        <AuditLogTable
          appLabel="biodata"
          models={["fbrprofile"]}
          recordFilter={recordFilter}
          onClearFilter={handleClearFilter}
        />
      ) : (
        <>
          <SignupApprovalsToolbar onRefresh={handleRefresh} />

          <div className="signup-approvals-page__filter-row">
            <div className="signup-approvals-page__search-wrap">
              <DebouncedSearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder={intl.formatMessage(messages.searchPlaceholder)}
              />
            </div>
            <span className="signup-approvals-page__count">
              {intl.formatMessage(messages.pendingCount, { count: totalApprovals })}
            </span>
          </div>

          {errorMessage && <Alert variant="danger" className="mb-3">{errorMessage}</Alert>}

          <SignupApprovalsList
            isLoading={isLoading}
            approvals={approvals}
            onAssign={handleAssign}
            page={page}
            totalPages={totalPages}
            start={start}
            end={end}
            total={totalApprovals}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(value) => { setRowsPerPage(value); setCurrentPage(1); }}
          />
        </>
      )}

      <Toast show={showToast} onClose={() => setShowToast(false)}>
        {toastMessage}
      </Toast>

      {assignmentUser && (
        <AddUserModal
          onClose={handleModalClose}
          assignmentUser={assignmentUser}
        />
      )}
    </div>
  );
};

export default SignupApprovalsPage;
