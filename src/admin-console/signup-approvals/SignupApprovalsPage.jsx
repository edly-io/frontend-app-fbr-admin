import React, { useState } from 'react';
import { Toast } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSignupApprovals } from './data/apiHooks';
import SignupApprovalsToolbar from './SignupApprovalsToolbar';
import SignupApprovalsList from './SignupApprovalsList';
import AddUserModal from '../components/AddUserModal';
import DebouncedSearchInput from '../shared/DebouncedSearchInput';
import messages from './messages';

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
    <>
      <SignupApprovalsToolbar onRefresh={handleRefresh} />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
      }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <DebouncedSearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
          />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', fontWeight: 500 }}>
          {intl.formatMessage(messages.pendingCount, { count: totalApprovals })}
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

      <Toast show={showToast} onClose={() => setShowToast(false)}>
        {toastMessage}
      </Toast>

      {assignmentUser && (
        <AddUserModal
          onClose={handleModalClose}
          assignmentUser={assignmentUser}
        />
      )}
    </>
  );
};

export default SignupApprovalsPage;
