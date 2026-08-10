import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getProfileMfeUserUrl } from '../../data/api';
import { useUsers, useSuperAdminAccessProbe, useUserDetailMutation } from './data/apiHooks';
import { TABS, DEFAULT_USERS_ROWS_PER_PAGE } from './constants';
import UsersToolbar from './UsersToolbar';
import UsersFilters from './UsersFilters';
import UsersTable from './UsersTable';
import AddUserModal from '../../components/user-modals/AddUserModal';
import BulkImportUsersModal from '../../components/user-modals/BulkImportUsersModal';
import ViewUserModal from '../../components/user-modals/ViewUserModal';
import messages from './messages';

const TAB_LABEL_MESSAGES = {
  all: messages.tabAll,
  'super-admins': messages.tabSuperAdmins,
  'middle-admins': messages.tabMiddleAdmins,
  'data-admins': messages.tabDataAdmins,
  instructors: messages.tabInstructors,
  trainees: messages.tabTrainees,
};

/**
 * Users page: role tabs + search + client-side status filter over a
 * server-paginated user list, row actions (view/edit/deactivate) and the
 * Add User / Bulk Import / View User modals.
 *
 * Behavior notes preserved from the monolith (see task constraints - not
 * "fixed" even though arguably inconsistent):
 *  - The status filter is applied client-side to only the already-fetched
 *    page of results; it does not re-query the server.
 *  - Pagination math (`totalPages`, `start`, `end`) is driven by the
 *    server-side total count for the *unfiltered* page, not the
 *    status-filtered subset actually rendered.
 *  - "Deactivate/Activate" is a purely client-side, non-persisted toggle
 *    (no request is sent) - modeled here as local `statusOverrides` applied
 *    on top of the query's cached data, rather than mutating the cache.
 */
const UsersPage = () => {
  const intl = useIntl();

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_USERS_ROWS_PER_PAGE);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [statusOverrides, setStatusOverrides] = useState({});

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [assignmentUser, setAssignmentUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [viewSourceTab, setViewSourceTab] = useState('all');

  const { canViewSuperAdminTabs } = useSuperAdminAccessProbe();
  const userDetailMutation = useUserDetailMutation();

  const visibleTabs = useMemo(
    () => TABS.filter(tab => !tab.superAdminOnly || canViewSuperAdminTabs),
    [canViewSuperAdminTabs],
  );
  const activeRole = visibleTabs.find(tab => tab.id === activeTab)?.role || null;

  useEffect(() => {
    if (!visibleTabs.some(tab => tab.id === activeTab)) {
      setActiveTab('all');
      setCurrentPage(1);
    }
  }, [activeTab, visibleTabs]);

  const {
    data, isLoading, isError, error,
  } = useUsers({
    page: currentPage, pageSize: rowsPerPage, role: activeRole, search,
  });

  const totalUsers = data?.total ?? 0;
  const users = useMemo(
    () => (data?.users ?? []).map(user => (
      statusOverrides[user.id] ? { ...user, status: statusOverrides[user.id] } : user
    )),
    [data, statusOverrides],
  );
  const filtered = users.filter(u => statusFilter === 'All' || u.status === statusFilter);

  const totalPages = Math.max(1, Math.ceil(totalUsers / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const pageUsers = filtered;
  const start = totalUsers === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min((page - 1) * rowsPerPage + pageUsers.length, totalUsers);

  const errorMessage = isError
    ? (error?.response?.data?.detail || intl.formatMessage(messages.loadError))
    : '';

  const handleTabChange = (tabId) => { setActiveTab(tabId); setCurrentPage(1); };
  const handleSearchChange = (value) => { setSearch(value); setCurrentPage(1); };
  const handleStatusFilterChange = (value) => { setStatusFilter(value); setCurrentPage(1); };

  const tabCounts = visibleTabs.reduce((acc, tab) => {
    acc[tab.id] = tab.id === activeTab ? totalUsers : null;
    return acc;
  }, {});

  const tabLabel = intl.formatMessage(TAB_LABEL_MESSAGES[activeTab] || messages.tabAll).toLowerCase();
  const countLabel = intl.formatMessage(messages.usersCount, { count: totalUsers, label: tabLabel });

  const handleAdd = () => {
    setAssignmentUser(null);
    setShowAddModal(true);
  };
  const handleImport = () => { setShowBulkImportModal(true); };
  const handleEdit = async (user) => {
    const detail = await userDetailMutation.mutateAsync(user);
    const profileUrl = getProfileMfeUserUrl(detail.id);
    if (profileUrl) {
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    }
  };
  const handleView = async (user, sourceTab = activeTab) => {
    setViewSourceTab(sourceTab);
    const detail = await userDetailMutation.mutateAsync(user);
    setViewingUser(detail);
  };
  const handleDeactivate = (user) => {
    setStatusOverrides(prev => ({
      ...prev,
      [user.id]: user.status === 'Active' ? 'Inactive' : 'Active',
    }));
  };
  const handleModalClose = () => {
    setShowAddModal(false);
    setAssignmentUser(null);
  };

  return (
    <>
      <UsersToolbar onImport={handleImport} onAdd={handleAdd} />

      <UsersFilters
        visibleTabs={visibleTabs}
        activeTab={activeTab}
        tabCounts={tabCounts}
        onTabChange={handleTabChange}
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        countLabel={countLabel}
      />

      {errorMessage && <Alert variant="danger" className="mb-3">{errorMessage}</Alert>}

      <UsersTable
        isLoading={isLoading}
        pageUsers={pageUsers}
        rowNumberOffset={(page - 1) * rowsPerPage}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        onView={handleView}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        page={page}
        totalPages={totalPages}
        start={start}
        end={end}
        total={totalUsers}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value) => { setRowsPerPage(value); setCurrentPage(1); }}
      />

      {showAddModal && (
        <AddUserModal
          onClose={handleModalClose}
          assignmentUser={assignmentUser}
        />
      )}
      {showBulkImportModal && (
        <BulkImportUsersModal onClose={() => setShowBulkImportModal(false)} />
      )}
      {viewingUser && (
        <ViewUserModal
          user={viewingUser}
          sourceTab={viewSourceTab}
          onClose={() => setViewingUser(null)}
          onEdit={(user) => { setViewingUser(null); handleEdit(user); }}
        />
      )}
    </>
  );
};

export default UsersPage;
