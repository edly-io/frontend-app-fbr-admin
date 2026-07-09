import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  Button, Badge, Dropdown, Form, Toast,
} from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faUserCheck, faEye, faPen, faEllipsisV, faPlus,
  faSync, faCheck, faChevronLeft, faChevronRight, faUpload,
} from '@fortawesome/free-solid-svg-icons';
import AddUserModal from './components/AddUserModal';
import BulkImportUsersModal from './components/BulkImportUsersModal';
import ViewUserModal from './components/ViewUserModal';
import DebouncedSearchInput from './components/DebouncedSearchInput';
import UserIdentity from './components/UserIdentity';

ensureConfig(['LMS_BASE_URL'], 'FBR admin console');

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    id: 'administration',
    title: 'Administration',
    items: [
      { id: 'users', label: 'Users', icon: faUsers },
      { id: 'signup-approvals', label: 'Signup Approvals', icon: faUserCheck },
      { id: 'biodata-edit-requests', label: 'Biodata Edit Request', icon: faPen },
    ],
  },
];

const TABS = [
  { id: 'all', label: 'All', role: null },
  {
    id: 'super-admins', label: 'Super Admins', role: 'super_admin', superAdminOnly: true,
  },
  {
    id: 'middle-admins', label: 'Middle Admins', role: 'middle_admin', superAdminOnly: true,
  },
  { id: 'data-admins', label: 'Data Admins', role: 'data_admin' },
  { id: 'instructors', label: 'Instructors', role: 'instructor' },
  { id: 'trainees', label: 'Trainees', role: 'trainee' },
];

// ─── Shared components ────────────────────────────────────────────────────────

const BIODATA_USER_LIST_PATH = '/fbr/api/biodata/v1/users/';
const BIODATA_USER_ME_PATH = '/fbr/api/biodata/v1/users/me/';
const BIODATA_USER_CITIES_PATH = '/fbr/api/biodata/v1/users/cities/';
const BIODATA_USER_BATCHES_PATH = '/fbr/api/biodata/v1/users/batches/';
const BIODATA_USER_ADMIN_CREATE_PATH = '/fbr/api/biodata/v1/users/admins/';
const BIODATA_USER_INSTRUCTOR_CREATE_PATH = '/fbr/api/biodata/v1/users/instructors/';
const BIODATA_USER_TRAINEE_CREATE_PATH = '/fbr/api/biodata/v1/users/trainees/';
const BIODATA_USER_UNREGISTERED_PATH = '/fbr/api/biodata/v1/users/unregistered/';
const BIODATA_USER_BULK_IMPORT_SAMPLE_PATH = '/fbr/api/biodata/v1/users/bulk-import/sample/';
const BIODATA_USER_BULK_IMPORT_PATH = '/fbr/api/biodata/v1/users/bulk-import/';
const BIODATA_EDIT_REQUESTS_PATH = '/fbr/api/biodata/v1/edit-requests/';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  middle_admin: 'Middle Admin',
  data_admin: 'Data Admin',
  instructor: 'Instructor',
  trainee: 'Trainee',
};

const STATUS_LABELS = {
  invited: 'Invited',
  active: 'Active',
  on_leave: 'On Leave',
  programme_closed: 'Programme Closed',
  deactivated: 'Deactivated',
  lapsed: 'Lapsed',
};

const StatusBadge = ({ status }) => {
  const active = status === 'Active';
  return (
    <span style={{
      background: active ? '#EDFAF1' : 'var(--pgn-color-gray-100)', color: active ? 'var(--pgn-color-green)' : 'var(--pgn-color-gray-base)', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px',
    }}
    >
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%', background: active ? 'var(--pgn-color-green)' : 'var(--pgn-color-gray-400)', flexShrink: 0,
      }}
      />
      {status}
    </span>
  );
};

StatusBadge.propTypes = { status: PropTypes.string.isRequired };

const RequestStatusBadge = ({ status }) => {
  const isPending = status === 'pending';
  return (
    <span style={{
      background: isPending ? '#FFF3E0' : '#EDFAF1', color: isPending ? '#B45309' : 'var(--pgn-color-green)', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px',
    }}
    >
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%', background: isPending ? '#B45309' : 'var(--pgn-color-green)', flexShrink: 0,
      }}
      />
      {isPending ? 'Pending' : 'Resolved'}
    </span>
  );
};

RequestStatusBadge.propTypes = { status: PropTypes.string.isRequired };

const getEditRequestStatusLabel = (status) => {
  if (status === 'all') {
    return 'All';
  }

  if (status === 'pending') {
    return 'Pending';
  }

  return 'Resolved';
};

const getBiodataUsersUrl = () => `${getConfig().LMS_BASE_URL}${BIODATA_USER_LIST_PATH}`;

const getLmsUrl = path => `${getConfig().LMS_BASE_URL}${path}`;

const getBiodataUserDetailUrl = id => `${getConfig().LMS_BASE_URL}/fbr/api/biodata/v1/users/${id}/`;
const getBiodataUnregisteredUsersUrl = () => `${getConfig().LMS_BASE_URL}${BIODATA_USER_UNREGISTERED_PATH}`;
const getBiodataAssignRoleUrl = id => `${getConfig().LMS_BASE_URL}/fbr/api/biodata/v1/users/${id}/assign-role/`;
const getBiodataBulkImportSampleUrl = role => `${getConfig().LMS_BASE_URL}${BIODATA_USER_BULK_IMPORT_SAMPLE_PATH}?role=${encodeURIComponent(role)}`;
const getBiodataBulkImportUrl = () => `${getConfig().LMS_BASE_URL}${BIODATA_USER_BULK_IMPORT_PATH}`;
const getBiodataEditRequestsUrl = () => `${getConfig().LMS_BASE_URL}${BIODATA_EDIT_REQUESTS_PATH}`;
const getBiodataEditRequestResolveUrl = id => `${getConfig().LMS_BASE_URL}${BIODATA_EDIT_REQUESTS_PATH}${id}/resolve/`;

const getProfileCreatePath = (role) => {
  if (['super_admin', 'middle_admin', 'data_admin'].includes(role)) {
    return BIODATA_USER_ADMIN_CREATE_PATH;
  }
  if (role === 'instructor') { return BIODATA_USER_INSTRUCTOR_CREATE_PATH; }
  return BIODATA_USER_TRAINEE_CREATE_PATH;
};

const getRoleLabel = role => ROLE_LABELS[role] || role || 'Unassigned';

const getStatusLabel = status => STATUS_LABELS[status] || status || 'Unknown';

const getInitials = (name) => (
  (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
);

const getPhotoUrl = (photo) => {
  if (!photo) { return null; }
  if (/^https?:\/\//.test(photo)) { return photo; }
  return `${getConfig().LMS_BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
};

const getPaginatedResults = (data) => {
  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
};

const getProfileMfeUserUrl = (userId) => {
  if (!userId) { return null; }

  const configuredProfileUrl = getConfig().ACCOUNT_PROFILE_URL;
  const fallbackBaseUrl = (() => {
    const lmsBaseUrl = getConfig().LMS_BASE_URL;
    if (!lmsBaseUrl) {
      return null;
    }

    const lmsUrl = new URL(lmsBaseUrl);
    return `${lmsUrl.protocol}//apps.${lmsUrl.hostname}:1995/profile/`;
  })();

  const baseUrl = configuredProfileUrl
    ? `${configuredProfileUrl.replace(/\/?$/, '/')}`
    : fallbackBaseUrl;

  if (!baseUrl) { return null; }

  const url = new URL('u/', baseUrl);
  url.searchParams.set('for_user', String(userId));
  return url.toString();
};

const mapProfileToUser = profile => ({
  id: profile.id,
  username: profile.username || '',
  name: profile.full_name || 'Unnamed user',
  email: profile.email || '',
  mobile: profile.mobile || '',
  photo: getPhotoUrl(profile.photo),
  initials: getInitials(profile.full_name),
  color: '#1B5E7A',
  status: getStatusLabel(profile.status),
  statusValue: profile.status,
  roles: Array.isArray(profile.roles) ? profile.roles : [],
  roleLabels: (Array.isArray(profile.roles) ? profile.roles : []).map(getRoleLabel),
  role: getRoleLabel((Array.isArray(profile.roles) ? profile.roles : [])[0]),
  batchNo: profile.batch?.name || profile.batch_no || '',
  batch: profile.batch || null,
  org: profile.batch?.name || profile.batch_no || '',
});

// ─── Three-dot action menu ────────────────────────────────────────────────────

const MENU_ITEM = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '8px 16px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '13.5px',
  color: 'var(--pgn-color-gray-900)',
};

const ActionMenu = ({
  userId, userStatus, onView, onEdit, onDeactivate, openId, setOpenId,
}) => {
  const ref = useRef(null);
  const isOpen = openId === userId;
  const isActive = userStatus === 'Active';

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, [isOpen, setOpenId]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpenId(isOpen ? null : userId)}
        style={{
          background: 'none',
          border: isOpen ? '1.5px solid var(--pgn-color-primary-base)' : '1px solid var(--pgn-color-border)',
          borderRadius: '5px',
          cursor: 'pointer',
          padding: '4px 8px',
          color: isOpen ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-text-light)',
          lineHeight: 1,
        }}
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', border: '1px solid var(--pgn-color-border)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, minWidth: '160px', padding: '4px 0',
        }}
        >
          <button type="button" onClick={() => { setOpenId(null); onView(); }} style={MENU_ITEM}>View Profile</button>
          <button type="button" onClick={() => { setOpenId(null); onEdit(); }} style={MENU_ITEM}>Edit User</button>
          <div style={{ borderTop: '1px solid var(--pgn-color-gray-100)', margin: '4px 0' }} />
          <button
            type="button"
            onClick={() => { setOpenId(null); onDeactivate(); }}
            style={{ ...MENU_ITEM, color: isActive ? 'var(--pgn-color-red)' : 'var(--pgn-color-green)' }}
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )}
    </div>
  );
};

ActionMenu.propTypes = {
  userId: PropTypes.number.isRequired,
  userStatus: PropTypes.string.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  openId: PropTypes.number,
  setOpenId: PropTypes.func.isRequired,
};

ActionMenu.defaultProps = {
  openId: null,
};

// ─── Users view ───────────────────────────────────────────────────────────────

const UsersView = ({
  onAdd, onImport, onEdit, onView, reloadKey,
}) => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [canViewSuperAdminTabs, setCanViewSuperAdminTabs] = useState(false);

  const visibleTabs = useMemo(
    () => TABS.filter(tab => !tab.superAdminOnly || canViewSuperAdminTabs),
    [canViewSuperAdminTabs],
  );
  const activeRole = visibleTabs.find(tab => tab.id === activeTab)?.role || null;

  useEffect(() => {
    let isMounted = true;

    const checkSuperAdminAccess = async () => {
      const params = new URLSearchParams({
        role: 'super_admin',
        page: '1',
        page_size: '1',
      });

      try {
        await getAuthenticatedHttpClient().get(`${getBiodataUsersUrl()}?${params.toString()}`);
        if (isMounted) {
          setCanViewSuperAdminTabs(true);
        }
      } catch (error) {
        if (isMounted) {
          setCanViewSuperAdminTabs(false);
        }
      }
    };

    checkSuperAdminAccess();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!visibleTabs.some(tab => tab.id === activeTab)) {
      setActiveTab('all');
      setCurrentPage(1);
    }
  }, [activeTab, visibleTabs]);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      setIsLoading(true);
      setErrorMessage('');

      const params = new URLSearchParams({
        page: String(currentPage),
        page_size: String(rowsPerPage),
      });

      if (activeRole) { params.set('role', activeRole); }
      if (search.trim()) { params.set('search', search.trim()); }

      try {
        const { data } = await getAuthenticatedHttpClient().get(`${getBiodataUsersUrl()}?${params.toString()}`);
        const results = getPaginatedResults(data);

        if (!isMounted) { return; }
        setUsers(results.map(mapProfileToUser));
        setTotalUsers(typeof data?.count === 'number' ? data.count : results.length);
      } catch (error) {
        if (!isMounted) { return; }
        setUsers([]);
        setTotalUsers(0);
        setErrorMessage(error?.response?.data?.detail || 'Unable to load users.');
      } finally {
        if (isMounted) { setIsLoading(false); }
      }
    };

    fetchUsers();
    return () => { isMounted = false; };
  }, [activeRole, currentPage, rowsPerPage, reloadKey, search]);

  const filtered = users.filter(u => {
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(totalUsers / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const pageUsers = filtered;
  const start = totalUsers === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min((page - 1) * rowsPerPage + pageUsers.length, totalUsers);

  const handleTabChange = (tabId) => { setActiveTab(tabId); setCurrentPage(1); };
  const handleSearchChange = (value) => { setSearch(value); setCurrentPage(1); };

  const tabCounts = visibleTabs.reduce((acc, tab) => {
    acc[tab.id] = tab.id === activeTab ? totalUsers : null;
    return acc;
  }, {});

  const tabLabel = visibleTabs.find(t => t.id === activeTab)?.label.toLowerCase() || 'users';

  return (
    <>
      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', marginBottom: '14px' }}>
        <span>Administration</span>
        <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--pgn-color-gray-800)', fontWeight: 500 }}>Users</span>
      </p>

      {/* Title row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px',
      }}
      >
        <h1 style={{
          fontSize: '22px', fontWeight: 700, color: 'var(--pgn-color-text-base)', margin: 0,
        }}
        >Users
        </h1>
        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
          <Button variant="outline-primary" size="sm" onClick={onImport}>
            <FontAwesomeIcon icon={faUpload} style={{ marginRight: '6px' }} />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={onAdd}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '6px' }} />
            Add User
          </Button>
        </div>
      </div>
      <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '13.5px', marginBottom: '22px' }}>
        All users across the FBR admin console, grouped by role.
      </p>

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid var(--pgn-color-border)', marginBottom: '20px', display: 'flex' }}>
        {visibleTabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: '13.5px', fontWeight: active ? 600 : 400, color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-text-light)', background: 'transparent', borderBottom: active ? '2px solid var(--pgn-color-primary-base)' : '2px solid transparent', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
              <span style={{
                background: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-border)', color: active ? '#fff' : 'var(--pgn-color-text-light)', borderRadius: '9px', padding: '1px 6px', fontSize: '11px', fontWeight: 600,
              }}
              >
                {tabCounts[tab.id] ?? '—'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search / filter */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
      }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <DebouncedSearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, email, CNIC or mobile..."
          />
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="status-filter" style={{ fontSize: '13.5px' }}>
              Status: {statusFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {['All', 'Invited', 'Active', 'On Leave', 'Programme Closed', 'Deactivated', 'Lapsed'].map(s => (
                <Dropdown.Item key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }}>{s}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', fontWeight: 500 }}>{totalUsers} {tabLabel}</span>
      </div>

      {errorMessage && (
        <div style={{
          background: '#FDE8E8', color: '#9B1C1C', border: '1px solid #F8B4B4', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '13.5px',
        }}
        >
          {errorMessage}
        </div>
      )}

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', overflow: 'visible',
      }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ background: 'var(--pgn-color-gray-100)', borderBottom: '1px solid var(--pgn-color-border)' }}>
              {[['#', '52px'], ['FULL NAME'], ['EMAIL'], ['BATCH'], ['MOBILE'], ['STATUS'], ['ACTIONS', '110px']].map(([label, width]) => (
                <th
                  key={label}
                  style={{
                    padding: '11px 16px', textAlign: label === 'ACTIONS' ? 'center' : 'left', fontSize: '11px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.06em', width,
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pgn-color-text-light)' }}>Loading users...</td></tr>
            )}
            {!isLoading && pageUsers.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pgn-color-text-light)' }}>No users found.</td></tr>
            )}
            {!isLoading && pageUsers.map((user, idx) => (
              <tr
                key={user.id}
                style={{ borderBottom: idx < pageUsers.length - 1 ? '1px solid var(--pgn-color-gray-100)' : 'none' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--pgn-color-primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
              >
                <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-400)', fontWeight: 500 }}>{(page - 1) * rowsPerPage + idx + 1}</td>
                <td style={{ padding: '12px 16px' }}>
                  <UserIdentity
                    name={user.name}
                    badges={[user.role].filter(Boolean)}
                    size="compact"
                    avatarValue={user.photo || user.initials}
                  />
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--pgn-color-primary-base)' }}>{user.email}</td>
                <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-700)' }}>{user.batchNo || '—'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-700)' }}>{user.mobile || '—'}</td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={user.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{
                    display: 'flex', gap: '2px', justifyContent: 'center', alignItems: 'center',
                  }}
                  >
                    <Button variant="tertiary" size="sm" title="View" onClick={() => onView(user, activeTab)}>
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button variant="tertiary" size="sm" title="Edit" onClick={() => onEdit(user, activeTab)}>
                      <FontAwesomeIcon icon={faPen} />
                    </Button>
                    <ActionMenu
                      userId={user.id}
                      userStatus={user.status}
                      openId={openMenuId}
                      setOpenId={setOpenMenuId}
                      onView={() => onView(user, activeTab)}
                      onEdit={() => onEdit(user, activeTab)}
                      onDeactivate={() => setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u)))}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--pgn-color-gray-100)', background: 'var(--pgn-color-gray-100)',
        }}
        >
          <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)' }}>
            Showing <strong>{start}–{end}</strong> of <strong>{totalUsers}</strong>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Button variant="outline-secondary" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
              <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '10px' }} />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <Button key={n} size="sm" variant={n === page ? 'primary' : 'outline-secondary'} onClick={() => setCurrentPage(n)}>
                {n}
              </Button>
            ))}
            <Button variant="outline-secondary" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '10px' }} />
            </Button>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--pgn-color-text-light)',
          }}
          >
            Rows per page
            <Form.Control
              as="select"
              size="sm"
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              style={{ width: 'auto' }}
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </Form.Control>
          </div>
        </div>
      </div>
    </>
  );
};

UsersView.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  reloadKey: PropTypes.number.isRequired,
};

// ─── Signup Approvals view ─────────────────────────────────────────────────────

const SignupApprovalsView = ({
  onAssign, reloadKey, onCountChange,
}) => {
  const [approvals, setApprovals] = useState([]);
  const [totalApprovals, setTotalApprovals] = useState(0);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showNotification = (message) => { setToastMessage(message); setShowToast(true); };

  const handleRefresh = () => {
    setCurrentPage(1);
    setRefreshKey(prev => prev + 1);
    showNotification('Approvals refreshed');
  };

  useEffect(() => {
    let isMounted = true;
    const fetchApprovals = async () => {
      setIsLoading(true);
      setErrorMessage('');
      const params = new URLSearchParams({
        page: String(currentPage),
        page_size: String(rowsPerPage),
      });
      if (search.trim()) { params.set('search', search.trim()); }

      try {
        const { data } = await getAuthenticatedHttpClient().get(`${getBiodataUnregisteredUsersUrl()}?${params.toString()}`);
        const results = getPaginatedResults(data);
        if (!isMounted) { return; }
        setApprovals(results);
        setTotalApprovals(typeof data?.count === 'number' ? data.count : results.length);
        onCountChange(typeof data?.count === 'number' ? data.count : results.length);
      } catch (error) {
        if (!isMounted) { return; }
        setApprovals([]);
        setTotalApprovals(0);
        onCountChange(0);
        setErrorMessage(error?.response?.data?.detail || 'Unable to load sign-in approvals.');
      } finally {
        if (isMounted) { setIsLoading(false); }
      }
    };

    fetchApprovals();
    return () => { isMounted = false; };
  }, [currentPage, onCountChange, refreshKey, reloadKey, rowsPerPage, search]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalApprovals / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const start = totalApprovals === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min((page - 1) * rowsPerPage + approvals.length, totalApprovals);

  return (
    <>
      <p style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', marginBottom: '14px' }}>
        <span>Administration</span>
        <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--pgn-color-gray-800)', fontWeight: 500 }}>Signup Approvals</span>
      </p>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px',
      }}
      >
        <h1 style={{
          fontSize: '22px', fontWeight: 700, color: 'var(--pgn-color-text-base)', margin: 0,
        }}
        >Signup Approvals
        </h1>
        <Button variant="outline-secondary" size="sm" onClick={handleRefresh} style={{ marginTop: '2px' }}>
          <FontAwesomeIcon icon={faSync} style={{ marginRight: '6px' }} />
          Refresh
        </Button>
      </div>
      <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '13.5px', marginBottom: '24px' }}>
        Review pending sign-up requests and assign each user a role before granting access.
      </p>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
      }}
      >
        <DebouncedSearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by username, email or name..."
        />
        <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', fontWeight: 500 }}>{totalApprovals} pending</span>
      </div>

      {errorMessage && (
        <div style={{
          background: '#FDE8E8', color: '#9B1C1C', border: '1px solid #F8B4B4', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '13.5px',
        }}
        >
          {errorMessage}
        </div>
      )}

      {isLoading && (
        <div style={{
          background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', padding: '56px 32px', textAlign: 'center',
        }}
        >
          <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '15px', margin: 0 }}>Loading approvals...</p>
        </div>
      )}
      {!isLoading && approvals.length === 0 && (
        <div style={{
          background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', padding: '56px 32px', textAlign: 'center',
        }}
        >
          <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '15px', margin: 0 }}>No pending approval requests.</p>
        </div>
      )}
      {!isLoading && approvals.length > 0 && (
        <div style={{
          background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', overflow: 'hidden',
        }}
        >
          {approvals.map((req, idx) => (
            <div
              key={req.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', borderBottom: idx < approvals.length - 1 ? '1px solid var(--pgn-color-gray-100)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--pgn-color-primary-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <UserIdentity
                  name={[req.first_name, req.last_name].filter(Boolean).join(' ') || req.username}
                  badges={['Pending Approval']}
                  size="compact"
                  avatarValue={getInitials([req.first_name, req.last_name].filter(Boolean).join(' ') || req.username)}
                />
                <p style={{
                  margin: '3px 0 0', fontSize: '13px', color: 'var(--pgn-color-text-light)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
                }}
                >
                  <span style={{ color: 'var(--pgn-color-primary-base)' }}>{req.email}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{req.username}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>Joined {req.date_joined ? new Date(req.date_joined).toLocaleDateString() : '—'}</span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Button variant="success" size="sm" onClick={() => onAssign(req)}>
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px', marginRight: '6px' }} />
                  Assign Role
                </Button>
              </div>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--pgn-color-gray-100)', background: 'var(--pgn-color-gray-100)',
          }}
          >
            <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)' }}>
              Showing <strong>{start}–{end}</strong> of <strong>{totalApprovals}</strong>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Button variant="outline-secondary" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '10px' }} />
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '10px' }} />
              </Button>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--pgn-color-text-light)',
            }}
            >
              Rows per page
              <Form.Control
                as="select"
                size="sm"
                value={rowsPerPage}
                onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{ width: 'auto' }}
              >
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </Form.Control>
            </div>
          </div>
        </div>
      )}
      <Toast show={showToast} onClose={() => setShowToast(false)}>
        {toastMessage}
      </Toast>
    </>
  );
};

SignupApprovalsView.propTypes = {
  onAssign: PropTypes.func.isRequired,
  reloadKey: PropTypes.number.isRequired,
  onCountChange: PropTypes.func.isRequired,
};

// ─── Biodata Edit Requests view ───────────────────────────────────────────────

const formatDateTime = value => (value ? new Date(value).toLocaleString() : '—');

const BiodataEditRequestsView = ({ onCountChange }) => {
  const [requests, setRequests] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resolvingId, setResolvingId] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showNotification = (message) => { setToastMessage(message); setShowToast(true); };

  useEffect(() => {
    let isMounted = true;
    const fetchRequests = async () => {
      setIsLoading(true);
      setErrorMessage('');
      const params = new URLSearchParams({
        page: String(currentPage),
        page_size: String(rowsPerPage),
      });
      if (statusFilter !== 'all') { params.set('status', statusFilter); }

      try {
        const { data } = await getAuthenticatedHttpClient().get(`${getBiodataEditRequestsUrl()}?${params.toString()}`);
        const results = getPaginatedResults(data);
        if (!isMounted) { return; }
        setRequests(results);
        setTotalRequests(typeof data?.count === 'number' ? data.count : results.length);
        if (statusFilter === 'pending') {
          onCountChange(typeof data?.count === 'number' ? data.count : results.length);
        }
      } catch (error) {
        if (!isMounted) { return; }
        setRequests([]);
        setTotalRequests(0);
        if (statusFilter === 'pending') { onCountChange(0); }
        setErrorMessage(error?.response?.data?.detail || 'Unable to load biodata edit requests.');
      } finally {
        if (isMounted) { setIsLoading(false); }
      }
    };

    fetchRequests();
    return () => { isMounted = false; };
  }, [currentPage, onCountChange, refreshKey, rowsPerPage, statusFilter]);

  const handleResolve = async (requestId) => {
    setResolvingId(requestId);
    setErrorMessage('');
    try {
      await getAuthenticatedHttpClient().post(
        getBiodataEditRequestResolveUrl(requestId),
        { admin_note: adminNotes[requestId] || '' },
      );
      setAdminNotes(prev => ({ ...prev, [requestId]: '' }));
      setRefreshKey(prev => prev + 1);
      showNotification('Edit request marked as resolved.');
    } catch (error) {
      const data = error?.response?.data;
      setErrorMessage(data?.detail || data?.non_field_errors || 'Unable to resolve this request.');
    } finally {
      setResolvingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalRequests / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const start = totalRequests === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min((page - 1) * rowsPerPage + requests.length, totalRequests);

  return (
    <>
      <p style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', marginBottom: '14px' }}>
        <span>Administration</span>
        <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--pgn-color-gray-800)', fontWeight: 500 }}>Biodata Edit Request</span>
      </p>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px',
      }}
      >
        <h1 style={{
          fontSize: '22px', fontWeight: 700, color: 'var(--pgn-color-text-base)', margin: 0,
        }}
        >Biodata Edit Request
        </h1>
        <Button variant="outline-secondary" size="sm" onClick={() => setRefreshKey(prev => prev + 1)} style={{ marginTop: '2px' }}>
          <FontAwesomeIcon icon={faSync} style={{ marginRight: '6px' }} />
          Refresh
        </Button>
      </div>
      <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '13.5px', marginBottom: '22px' }}>
        Review trainee biodata edit requests and mark them resolved after making required updates.
      </p>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
      }}
      >
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="edit-request-status-filter" style={{ fontSize: '13.5px' }}>
            Status: {getEditRequestStatusLabel(statusFilter)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {[
              ['pending', 'Pending'],
              ['resolved', 'Resolved'],
              ['all', 'All'],
            ].map(([value, label]) => (
              <Dropdown.Item key={value} onClick={() => { setStatusFilter(value); setCurrentPage(1); }}>
                {label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', fontWeight: 500 }}>{totalRequests} requests</span>
      </div>

      {errorMessage && (
        <div style={{
          background: '#FDE8E8', color: '#9B1C1C', border: '1px solid #F8B4B4', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '13.5px',
        }}
        >
          {Array.isArray(errorMessage) ? errorMessage.join(' ') : errorMessage}
        </div>
      )}

      <div style={{
        background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', overflow: 'hidden',
      }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ background: 'var(--pgn-color-gray-100)', borderBottom: '1px solid var(--pgn-color-border)' }}>
              {['PROFILE', 'MESSAGE', 'STATUS', 'REQUESTED', 'RESOLVED BY', 'ADMIN NOTE', 'ACTION'].map(label => (
                <th
                  key={label}
                  style={{
                    padding: '11px 16px', textAlign: label === 'ACTION' ? 'center' : 'left', fontSize: '11px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.06em',
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pgn-color-text-light)' }}>Loading requests...</td></tr>
            )}
            {!isLoading && requests.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pgn-color-text-light)' }}>No biodata edit requests found.</td></tr>
            )}
            {!isLoading && requests.map((request, idx) => (
              <tr key={request.id} style={{ borderBottom: idx < requests.length - 1 ? '1px solid var(--pgn-color-gray-100)' : 'none', verticalAlign: 'top' }}>
                <td style={{ padding: '14px 16px', minWidth: '150px' }}>
                  <UserIdentity
                    name={request.profile_name || `Profile #${request.profile_id}`}
                    badges={['Trainee']}
                    size="compact"
                    avatarValue={getInitials(request.profile_name || `Profile ${request.profile_id}`)}
                  />
                </td>
                <td style={{
                  padding: '14px 16px', color: 'var(--pgn-color-gray-700)', maxWidth: '320px', whiteSpace: 'pre-wrap',
                }}
                >{request.message}
                </td>
                <td style={{ padding: '14px 16px' }}><RequestStatusBadge status={request.status} /></td>
                <td style={{ padding: '14px 16px', color: 'var(--pgn-color-gray-700)', minWidth: '130px' }}>{formatDateTime(request.created_at)}</td>
                <td style={{ padding: '14px 16px', color: 'var(--pgn-color-gray-700)' }}>
                  {request.resolved_by_name ? (
                    <UserIdentity
                      name={request.resolved_by_name}
                      badges={['Admin']}
                      size="compact"
                      avatarValue={getInitials(request.resolved_by_name)}
                    />
                  ) : '—'}
                </td>
                <td style={{ padding: '14px 16px', minWidth: '220px' }}>
                  {request.status === 'pending' ? (
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={adminNotes[request.id] || ''}
                      placeholder="Optional note"
                      onChange={event => setAdminNotes(prev => ({ ...prev, [request.id]: event.target.value }))}
                    />
                  ) : (
                    <span style={{ color: 'var(--pgn-color-gray-700)', whiteSpace: 'pre-wrap' }}>{request.admin_note || '—'}</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center', minWidth: '120px' }}>
                  {request.status === 'pending' ? (
                    <Button variant="success" size="sm" onClick={() => handleResolve(request.id)} disabled={resolvingId === request.id}>
                      <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px', marginRight: '6px' }} />
                      {resolvingId === request.id ? 'Resolving...' : 'Resolve'}
                    </Button>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--pgn-color-text-light)' }}>Resolved {formatDateTime(request.resolved_at)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--pgn-color-gray-100)', background: 'var(--pgn-color-gray-100)',
        }}
        >
          <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)' }}>
            Showing <strong>{start}–{end}</strong> of <strong>{totalRequests}</strong>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Button variant="outline-secondary" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
              <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '10px' }} />
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '10px' }} />
            </Button>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--pgn-color-text-light)',
          }}
          >
            Rows per page
            <Form.Control
              as="select"
              size="sm"
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              style={{ width: 'auto' }}
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </Form.Control>
          </div>
        </div>
      </div>
      <Toast show={showToast} onClose={() => setShowToast(false)}>
        {toastMessage}
      </Toast>
    </>
  );
};

BiodataEditRequestsView.propTypes = {
  onCountChange: PropTypes.func.isRequired,
};

// ─── Placeholder for unbuilt views ────────────────────────────────────────────

const PlaceholderView = ({ title }) => (
  <>
    <p style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', marginBottom: '14px' }}>
      <span>Administration</span>
      <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
      <span style={{ color: 'var(--pgn-color-gray-800)', fontWeight: 500 }}>{title}</span>
    </p>
    <h1 style={{
      fontSize: '22px', fontWeight: 700, color: 'var(--pgn-color-text-base)', marginBottom: '24px',
    }}
    >{title}
    </h1>
    <div style={{
      background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', padding: '56px 32px', textAlign: 'center',
    }}
    >
      <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '15px', margin: 0 }}>This section is under construction.</p>
    </div>
  </>
);

PlaceholderView.propTypes = { title: PropTypes.string.isRequired };

// ─── Root component ───────────────────────────────────────────────────────────

const AdminConsolePage = () => {
  const [activeNav, setActiveNav] = useState('users');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [assignmentUser, setAssignmentUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [viewSourceTab, setViewSourceTab] = useState('all');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [pendingEditRequestsCount, setPendingEditRequestsCount] = useState(0);
  const [approvalReloadKey, setApprovalReloadKey] = useState(0);
  const [userListReloadKey, setUserListReloadKey] = useState(0);
  const [callerProfile, setCallerProfile] = useState({ roles: [], city: null, creatable_roles: ['instructor', 'trainee'] });
  const [cities, setCities] = useState([]);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadCreationContext = async () => {
      try {
        const [{ data: profileData }, { data: cityData }, { data: batchData }] = await Promise.all([
          getAuthenticatedHttpClient().get(getLmsUrl(BIODATA_USER_ME_PATH)),
          getAuthenticatedHttpClient().get(getLmsUrl(BIODATA_USER_CITIES_PATH)),
          getAuthenticatedHttpClient().get(getLmsUrl(BIODATA_USER_BATCHES_PATH)),
        ]);

        if (!isMounted) { return; }
        setCallerProfile({
          ...profileData,
          roles: Array.isArray(profileData?.roles) ? profileData.roles : [],
          creatable_roles: Array.isArray(profileData?.creatable_roles)
            ? profileData.creatable_roles
            : ['instructor', 'trainee'],
        });
        setCities(Array.isArray(cityData) ? cityData : []);
        setBatches(Array.isArray(batchData) ? batchData : []);
      } catch (error) {
        if (!isMounted) { return; }
        setCallerProfile({ roles: [], city: null, creatable_roles: ['instructor', 'trainee'] });
        setCities([]);
        setBatches([]);
      }
    };

    loadCreationContext();
    return () => { isMounted = false; };
  }, []);

  const fetchUserDetail = async user => {
    const { data } = await getAuthenticatedHttpClient().get(getBiodataUserDetailUrl(user.id));
    return {
      ...user,
      ...data,
      photo: getPhotoUrl(data.photo) || user.photo,
      initials: getInitials(data.full_name || user.name),
      color: user.color || '#1B5E7A',
      status: getStatusLabel(data.status) || user.status,
      roleLabels: Array.isArray(data.roles) ? data.roles.map(getRoleLabel) : user.roleLabels,
      batchNo: data.trainee_profile?.batch?.name || user.batchNo,
    };
  };

  const handleAdd = () => {
    setAssignmentUser(null);
    setShowAddModal(true);
  };
  const handleImport = () => { setShowBulkImportModal(true); };
  const handleEdit = async (user) => {
    const detail = await fetchUserDetail(user);
    const profileUrl = getProfileMfeUserUrl(detail.id);
    if (profileUrl) {
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    }
  };
  const handleView = async (user, sourceTab = 'all') => {
    setViewSourceTab(sourceTab);
    const detail = await fetchUserDetail(user);
    setViewingUser(detail);
  };
  const handleAssignApproval = (user) => {
    setAssignmentUser(user);
    setShowAddModal(true);
  };
  const handleModalClose = () => {
    setShowAddModal(false);
    setAssignmentUser(null);
  };
  const handleBulkImport = async ({ role, file, dryRun }) => {
    const formData = new FormData();
    formData.append('role', role);
    formData.append('dry_run', dryRun ? 'true' : 'false');
    formData.append('file', file);

    const { data } = await getAuthenticatedHttpClient().post(getBiodataBulkImportUrl(), formData);
    if (!dryRun) {
      setUserListReloadKey(prev => prev + 1);
    }
    return data;
  };
  const handleDownloadBulkImportSample = async (role) => {
    const { data } = await getAuthenticatedHttpClient().get(getBiodataBulkImportSampleUrl(role), {
      responseType: 'blob',
    });
    return data;
  };
  const handleCreateUser = async ({
    assignmentUserId, role, payload,
  }) => {
    if (assignmentUserId) {
      await getAuthenticatedHttpClient().post(getBiodataAssignRoleUrl(assignmentUserId), payload);
      setApprovalReloadKey(prev => prev + 1);
    } else {
      await getAuthenticatedHttpClient().post(getLmsUrl(getProfileCreatePath(role)), payload);
    }
    setUserListReloadKey(prev => prev + 1);
  };

  const renderView = () => {
    switch (activeNav) {
      case 'signup-approvals': return (
        <SignupApprovalsView
          onAssign={handleAssignApproval}
          reloadKey={approvalReloadKey}
          onCountChange={setPendingApprovalsCount}
        />
      );
      case 'biodata-edit-requests': return (
        <BiodataEditRequestsView
          onCountChange={setPendingEditRequestsCount}
        />
      );
      case 'courses': return <PlaceholderView title="Courses" />;
      case 'regional-offices': return <PlaceholderView title="Regional Offices" />;
      case 'access-policies': return <PlaceholderView title="Access Policies" />;
      case 'audit-log': return <PlaceholderView title="Audit Log" />;
      default: return (
        <UsersView
          onAdd={handleAdd}
          onImport={handleImport}
          onEdit={handleEdit}
          onView={handleView}
          reloadKey={userListReloadKey}
        />
      );
    }
  };

  return (
    <main style={{ display: 'flex', background: 'var(--pgn-color-theme-bg-gray)', minHeight: '100vh' }}>

      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0, background: '#fff', borderRight: '1px solid var(--pgn-color-border)', padding: '24px 12px',
      }}
      >
        {NAV_SECTIONS.map(section => (
          <div key={section.id}>
            <p style={{
              fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', margin: '16px 0 6px',
            }}
            >
              {section.title}
            </p>
            {section.items.map(item => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', width: '100%', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13.5px', fontWeight: active ? 600 : 400, background: active ? 'var(--pgn-color-primary-light)' : 'transparent', color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-gray-700)', textAlign: 'left', marginBottom: '2px',
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} style={{ width: '15px', opacity: 0.8, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.id === 'signup-approvals' && pendingApprovalsCount > 0 && (
                    <Badge variant="danger">{pendingApprovalsCount}</Badge>
                  )}
                  {item.id === 'biodata-edit-requests' && pendingEditRequestsCount > 0 && (
                    <Badge variant="danger">{pendingEditRequestsCount}</Badge>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, padding: '28px 36px', minWidth: 0 }}>
        {renderView()}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          onClose={handleModalClose}
          assignmentUser={assignmentUser}
          onSubmit={handleCreateUser}
          allowedRoles={callerProfile.creatable_roles}
          callerProfile={callerProfile}
          cities={cities}
          batches={batches}
        />
      )}
      {showBulkImportModal && (
        <BulkImportUsersModal
          onClose={() => setShowBulkImportModal(false)}
          onImport={handleBulkImport}
          onDownloadSample={handleDownloadBulkImportSample}
          allowedRoles={callerProfile.creatable_roles}
        />
      )}
      {viewingUser && (
        <ViewUserModal
          user={viewingUser}
          sourceTab={viewSourceTab}
          onClose={() => setViewingUser(null)}
          onEdit={(user) => { setViewingUser(null); handleEdit(user, viewSourceTab); }}
        />
      )}
    </main>
  );
};

export default AdminConsolePage;
