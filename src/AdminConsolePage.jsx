import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Badge, Dropdown, Form, Toast,
} from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faUserCheck, faEye, faPen, faEllipsisV, faDownload, faPlus,
  faSearch, faSync, faCheck, faTimes, faChevronLeft, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import AddUserModal from './components/AddUserModal';
import ViewUserModal from './components/ViewUserModal';

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_USERS = [
  {
    id: 1,
    initials: 'SA',
    color: '#5C7A8A',
    name: 'Sana Akhtar',
    email: 'sana.akhtar@fbr.gov.pk',
    role: 'Super Admin',
    org: 'HQ Islamabad',
    status: 'Active',
    bpsGrade: 'BPS-20',
    designation: 'Chief Commissioner IR',
    mobile: '+92-321-1234567',
    cnic: '61101-1234567-8',
  },
  {
    id: 2,
    initials: 'TM',
    color: '#C98A2A',
    name: 'Tariq Mahmood',
    email: 't.mahmood@fbr.gov.pk',
    role: 'Super Admin',
    org: 'HQ Islamabad',
    status: 'Active',
    bpsGrade: 'BPS-21',
    designation: 'Member Inland Revenue',
    mobile: '+92-300-9876543',
    cnic: '35202-9876543-2',
  },
  {
    id: 3,
    initials: 'RB',
    color: '#5E8A6A',
    name: 'Rashid Bhatti',
    email: 'r.bhatti@fbr.gov.pk',
    role: 'Middle Admin',
    org: 'RTO Lahore',
    status: 'Active',
    bpsGrade: 'BPS-18',
    designation: 'ACIR',
    mobile: '+92-333-1122334',
    cnic: '35301-1122334-5',
  },
  {
    id: 4,
    initials: 'ZH',
    color: '#2A9E9A',
    name: 'Zainab Hameed',
    email: 'z.hameed@fbr.gov.pk',
    role: 'Middle Admin',
    org: 'RTO Karachi',
    status: 'Active',
    bpsGrade: 'BPS-17',
    designation: 'Superintendent IR',
    mobile: '+92-345-5566778',
    cnic: '42101-5566778-9',
  },
  {
    id: 5,
    initials: 'OM',
    color: '#C07820',
    name: 'Owais Mukhtar',
    email: 'o.mukhtar@fbr.gov.pk',
    role: 'Middle Admin',
    org: 'RTO Peshawar',
    status: 'Inactive',
    bpsGrade: 'BPS-18',
    designation: 'ACIR',
    mobile: '+92-313-7788990',
    cnic: '17301-7788990-1',
  },
  {
    id: 6,
    initials: 'NI',
    color: '#7A4FC4',
    name: 'Nadia Iqbal',
    email: 'n.iqbal@fbr.gov.pk',
    role: 'Data Admin',
    org: 'LTU Karachi',
    status: 'Active',
    bpsGrade: 'BPS-17',
    designation: 'Inspector IR',
    mobile: '+92-321-1122334',
    cnic: '42101-1122334-5',
  },
  {
    id: 7,
    initials: 'AK',
    color: '#3A7DC9',
    name: 'Asad Khan',
    email: 'a.khan@fbr.gov.pk',
    role: 'Data Admin',
    org: 'RTO Islamabad',
    status: 'Active',
    bpsGrade: 'BPS-17',
    designation: 'Inspector IR',
    mobile: '+92-300-5544332',
    cnic: '61101-5544332-1',
  },
  {
    id: 8,
    initials: 'HR',
    color: '#9E5A2A',
    name: 'Hassan Raza',
    email: 'h.raza@fbr.gov.pk',
    role: 'Data Admin',
    org: 'RTO Faisalabad',
    status: 'Inactive',
    bpsGrade: 'BPS-17',
    designation: 'Inspector IR',
    mobile: '+92-333-6677889',
    cnic: '33100-6677889-0',
  },
  {
    id: 9,
    initials: 'FA',
    color: '#2A8A5A',
    name: 'Fatima Ali',
    email: 'f.ali@fbr.gov.pk',
    role: 'Instructor',
    org: 'FBR Training Academy',
    status: 'Active',
  },
  {
    id: 10,
    initials: 'MK',
    color: '#5A3A8A',
    name: 'Muhammad Khan',
    email: 'm.khan@fbr.gov.pk',
    role: 'Instructor',
    org: 'NTRC Islamabad',
    status: 'Active',
  },
  {
    id: 11,
    initials: 'AS',
    color: '#8A5C3A',
    name: 'Ayesha Siddiqui',
    email: 'a.siddiqui@fbr.gov.pk',
    role: 'Trainee',
    org: 'Batch 2024-A',
    status: 'Active',
    bpsGrade: 'BPS-17',
    cnic: '35202-1122334-0',
  },
  {
    id: 12,
    initials: 'HN',
    color: '#3A7A5C',
    name: 'Hassan Naqvi',
    email: 'h.naqvi@fbr.gov.pk',
    role: 'Trainee',
    org: 'Batch 2024-A',
    status: 'Active',
    bpsGrade: 'BPS-17',
    cnic: '61101-9988776-5',
  },
  {
    id: 13,
    initials: 'ZA',
    color: '#7A3A5C',
    name: 'Zara Ahmed',
    email: 'z.ahmed@fbr.gov.pk',
    role: 'Trainee',
    org: 'Batch 2024-B',
    status: 'Inactive',
    bpsGrade: 'BPS-17',
    cnic: '42101-3344556-7',
  },
];

const INITIAL_APPROVALS = [
  {
    id: 1,
    initials: 'MS',
    color: '#7A9DAE',
    name: 'Mariam Sajid',
    email: 'mariam.sajid@fbr.gov.pk',
    org: 'RTO Faisalabad',
    requestedAt: '03 May 2026, 09:14',
  },
  {
    id: 2,
    initials: 'FM',
    color: '#C4922A',
    name: 'Faraz Mehboob',
    email: 'faraz.m@customs.gov.pk',
    org: 'Pakistan Customs',
    requestedAt: '03 May 2026, 11:02',
  },
  {
    id: 3,
    initials: 'HS',
    color: '#8A9CAC',
    name: 'Hira Sultan',
    email: 'hira.sultan@fbr.gov.pk',
    org: 'HQ Islamabad',
    requestedAt: '04 May 2026, 08:35',
  },
  {
    id: 4,
    initials: 'BK',
    color: '#4A9A8A',
    name: 'Bilal Khattak',
    email: 'b.khattak@fbr.gov.pk',
    org: 'RTO Peshawar',
    requestedAt: '04 May 2026, 10:48',
  },
];

const APPROVAL_DEFAULT_ROLES = {
  1: 'Trainee',
  2: 'Instructor',
  3: 'Middle Admin',
  4: 'Trainee',
};
const APPROVAL_ROLES = ['Super Admin', 'Middle Admin', 'Data Admin', 'Instructor', 'Trainee'];

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    id: 'administration', title: 'Administration',
    items: [
      { id: 'users', label: 'Users', icon: faUsers },
      { id: 'signup-approvals', label: 'Signup Approvals', icon: faUserCheck },
    ],
  },
];

const TABS = [
  { id: 'all', label: 'All', role: null },
  { id: 'super-admins', label: 'Super Admins', role: 'Super Admin' },
  { id: 'middle-admins', label: 'Middle Admins', role: 'Middle Admin' },
  { id: 'data-admins', label: 'Data Admins', role: 'Data Admin' },
  { id: 'instructors', label: 'Instructors', role: 'Instructor' },
  { id: 'trainees', label: 'Trainees', role: 'Trainee' },
];

// ─── Shared components ────────────────────────────────────────────────────────

const ROLE_STYLE = {
  'Super Admin': { bg: '#FDE8E8', text: '#C53030' },
  'Middle Admin': { bg: '#F2EBFF', text: '#6B3FA0' },
  'Data Admin': { bg: '#FFF3E0', text: '#B45309' },
  Instructor: { bg: '#E8F0FF', text: '#2B5CB0' },
  Trainee: { bg: '#E8F7EE', text: '#276749' },
};

const RoleBadge = ({ role }) => {
  const s = ROLE_STYLE[role] || { bg: '#F0F0F0', text: '#555' };
  return (
    <span style={{ background: s.bg, color: s.text, padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.text, flexShrink: 0 }} />
      {role}
    </span>
  );
};

RoleBadge.propTypes = { role: PropTypes.string.isRequired };

const StatusBadge = ({ status }) => {
  const active = status === 'Active';
  return (
    <span style={{ background: active ? '#EDFAF1' : 'var(--pgn-color-gray-100)', color: active ? 'var(--pgn-color-green)' : 'var(--pgn-color-gray-base)', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: active ? 'var(--pgn-color-green)' : 'var(--pgn-color-gray-400)', flexShrink: 0 }} />
      {status}
    </span>
  );
};

StatusBadge.propTypes = { status: PropTypes.string.isRequired };

const UserAvatar = ({ initials, color, size }) => (
  <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size < 40 ? '12px' : '14px', fontWeight: 700, flexShrink: 0, letterSpacing: '0.03em' }}>
    {initials}
  </div>
);

UserAvatar.propTypes = {
  initials: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.number,
};

UserAvatar.defaultProps = { size: 34 };

// ─── Three-dot action menu ────────────────────────────────────────────────────

const MENU_ITEM = {
  display: 'block', width: '100%', textAlign: 'left',
  padding: '8px 16px', border: 'none', background: 'none',
  cursor: 'pointer', fontSize: '13.5px', color: 'var(--pgn-color-gray-900)',
};

const ActionMenu = ({
  userId, userStatus, onView, onEdit, onDeactivate, openId, setOpenId,
}) => {
  const ref = useRef(null);
  const isOpen = openId === userId;
  const isActive = userStatus === 'Active';

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpenId(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, setOpenId]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpenId(isOpen ? null : userId)}
        style={{
          background: 'none', border: isOpen ? '1.5px solid var(--pgn-color-primary-base)' : '1px solid var(--pgn-color-border)',
          borderRadius: '5px', cursor: 'pointer', padding: '4px 8px',
          color: isOpen ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-text-light)', lineHeight: 1,
        }}
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      {isOpen && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', border: '1px solid var(--pgn-color-border)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, minWidth: '160px', padding: '4px 0' }}>
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

const UsersView = ({ onAdd, onEdit, onView }) => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = !s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.org.toLowerCase().includes(s);
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    const matchTab = activeTab === 'all'
      || (activeTab === 'super-admins' && u.role === 'Super Admin')
      || (activeTab === 'middle-admins' && u.role === 'Middle Admin')
      || (activeTab === 'data-admins' && u.role === 'Data Admin')
      || (activeTab === 'instructors' && u.role === 'Instructor')
      || (activeTab === 'trainees' && u.role === 'Trainee');
    return matchSearch && matchStatus && matchTab;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const pageUsers = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const start = filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, filtered.length);

  const handleTabChange = (tabId) => { setActiveTab(tabId); setCurrentPage(1); };
  const handleSearchChange = (e) => { setSearch(e.target.value); setCurrentPage(1); };

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab.id] = tab.role ? users.filter(u => u.role === tab.role).length : users.length;
    return acc;
  }, {});

  const tabLabel = TABS.find(t => t.id === activeTab)?.label.toLowerCase() || 'users';

  return (
    <>
      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', marginBottom: '14px' }}>
        <span>Administration</span>
        <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--pgn-color-gray-800)', fontWeight: 500 }}>Users</span>
      </p>

      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--pgn-color-text-base)', margin: 0 }}>Users</h1>
        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
          <Button variant="outline-primary" size="sm">
            <FontAwesomeIcon icon={faDownload} style={{ marginRight: '6px' }} />
            Export
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
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)} style={{ padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: '13.5px', fontWeight: active ? 600 : 400, color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-text-light)', background: 'transparent', borderBottom: active ? '2px solid var(--pgn-color-primary-base)' : '2px solid transparent', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              {tab.label}
              <span style={{ background: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-border)', color: active ? '#fff' : 'var(--pgn-color-text-light)', borderRadius: '9px', padding: '1px 6px', fontSize: '11px', fontWeight: 600 }}>
                {tabCounts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search / filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon
              icon={faSearch}
              style={{
                position: 'absolute',
                left: '11px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#ADB5BD',
                fontSize: '13px',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
            <Form.Control
              type="text"
              placeholder="Search by name, email, organization or batch..."
              value={search}
              onChange={handleSearchChange}
              style={{ paddingLeft: '34px', width: '340px' }}
            />
          </div>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="status-filter" style={{ fontSize: '13.5px' }}>
              Status: {statusFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {['All', 'Active', 'Inactive'].map(s => (
                <Dropdown.Item key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }}>{s}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', fontWeight: 500 }}>{filtered.length} {tabLabel}</span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ background: 'var(--pgn-color-gray-100)', borderBottom: '1px solid var(--pgn-color-border)' }}>
              {[['#', '52px'], ['NAME'], ['EMAIL'], ['ROLE'], ['ORGANIZATION / BATCH'], ['STATUS'], ['ACTIONS', '110px']].map(([label, width]) => (
                <th key={label} style={{ padding: '11px 16px', textAlign: label === 'ACTIONS' ? 'center' : 'left', fontSize: '11px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.06em', width }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageUsers.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pgn-color-text-light)' }}>No users found.</td></tr>
            ) : pageUsers.map((user, idx) => (
              <tr
                key={user.id}
                style={{ borderBottom: idx < pageUsers.length - 1 ? '1px solid var(--pgn-color-gray-100)' : 'none' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--pgn-color-primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
              >
                <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-400)', fontWeight: 500 }}>{(page - 1) * rowsPerPage + idx + 1}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <UserAvatar initials={user.initials} color={user.color} />
                    <span style={{ fontWeight: 500, color: 'var(--pgn-color-text-base)' }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--pgn-color-primary-base)' }}>{user.email}</td>
                <td style={{ padding: '12px 16px' }}><RoleBadge role={user.role} /></td>
                <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-700)' }}>{user.org}</td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={user.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', alignItems: 'center' }}>
                    <Button variant="tertiary" size="sm" title="View" onClick={() => onView(user)}>
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button variant="tertiary" size="sm" title="Edit" onClick={() => onEdit(user)}>
                      <FontAwesomeIcon icon={faPen} />
                    </Button>
                    <ActionMenu
                      userId={user.id}
                      userStatus={user.status}
                      openId={openMenuId}
                      setOpenId={setOpenMenuId}
                      onView={() => onView(user)}
                      onEdit={() => onEdit(user)}
                      onDeactivate={() => setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--pgn-color-gray-100)', background: 'var(--pgn-color-gray-100)' }}>
          <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)' }}>
            Showing <strong>{start}–{end}</strong> of <strong>{filtered.length}</strong>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--pgn-color-text-light)' }}>
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
  onEdit: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};

// ─── Signup Approvals view ─────────────────────────────────────────────────────

const SignupApprovalsView = ({
  approvals, setApprovals, roles, setRoles,
}) => {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showNotification = (message) => { setToastMessage(message); setShowToast(true); };

  const handleApprove = (id) => { setApprovals(prev => prev.filter(a => a.id !== id)); showNotification('Request Approved'); };
  const handleReject = (id) => { setApprovals(prev => prev.filter(a => a.id !== id)); showNotification('Request Rejected'); };
  const handleRefresh = () => { setApprovals(INITIAL_APPROVALS); setRoles({ ...APPROVAL_DEFAULT_ROLES }); };

  return (
    <>
      <p style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', marginBottom: '14px' }}>
        <span>Administration</span>
        <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--pgn-color-gray-800)', fontWeight: 500 }}>Signup Approvals</span>
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--pgn-color-text-base)', margin: 0 }}>Signup Approvals</h1>
        <Button variant="outline-secondary" size="sm" onClick={handleRefresh} style={{ marginTop: '2px' }}>
          <FontAwesomeIcon icon={faSync} style={{ marginRight: '6px' }} />
          Refresh
        </Button>
      </div>
      <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '13.5px', marginBottom: '24px' }}>
        Review pending sign-up requests and assign each user a role before granting access.
      </p>
      {approvals.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', padding: '56px 32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '15px', margin: 0 }}>No pending approval requests.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', overflow: 'hidden' }}>
          {approvals.map((req, idx) => (
            <div
              key={req.id}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', borderBottom: idx < approvals.length - 1 ? '1px solid var(--pgn-color-gray-100)' : 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--pgn-color-primary-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; }}
            >
              <UserAvatar initials={req.initials} color={req.color} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--pgn-color-text-base)' }}>{req.name}</p>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--pgn-color-text-light)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--pgn-color-primary-base)' }}>{req.email}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{req.org}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>Requested {req.requestedAt}</span>
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <Form.Label className="x-small font-weight-bold mb-0" style={{ color: 'var(--pgn-color-gray-400)', letterSpacing: '0.06em' }}>ROLE</Form.Label>
                <Form.Control
                  as="select"
                  size="sm"
                  value={roles[req.id]}
                  onChange={e => setRoles(prev => ({ ...prev, [req.id]: e.target.value }))}
                  style={{ minWidth: '140px' }}
                >
                  {APPROVAL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </Form.Control>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Button variant="success" size="sm" onClick={() => handleApprove(req.id)}>
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px', marginRight: '6px' }} />
                  Approve
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleReject(req.id)}>
                  <FontAwesomeIcon icon={faTimes} style={{ fontSize: '12px', marginRight: '6px' }} />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Toast show={showToast} onClose={() => setShowToast(false)}>
        {toastMessage}
      </Toast>
    </>
  );
};

SignupApprovalsView.propTypes = {
  approvals: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    initials: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    org: PropTypes.string.isRequired,
    requestedAt: PropTypes.string.isRequired,
  })).isRequired,
  setApprovals: PropTypes.func.isRequired,
  roles: PropTypes.objectOf(PropTypes.string).isRequired,
  setRoles: PropTypes.func.isRequired,
};

// ─── Placeholder for unbuilt views ────────────────────────────────────────────

const PlaceholderView = ({ title }) => (
  <>
    <p style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', marginBottom: '14px' }}>
      <span>Administration</span>
      <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
      <span style={{ color: 'var(--pgn-color-gray-800)', fontWeight: 500 }}>{title}</span>
    </p>
    <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--pgn-color-text-base)', marginBottom: '24px' }}>{title}</h1>
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', padding: '56px 32px', textAlign: 'center' }}>
      <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '15px', margin: 0 }}>This section is under construction.</p>
    </div>
  </>
);

PlaceholderView.propTypes = { title: PropTypes.string.isRequired };

// ─── Root component ───────────────────────────────────────────────────────────

const AdminConsolePage = () => {
  const [activeNav, setActiveNav] = useState('users');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [roles, setRoles] = useState({ ...APPROVAL_DEFAULT_ROLES });

  const handleAdd = () => { setEditingUser(null); setShowAddModal(true); };
  const handleEdit = (user) => { setEditingUser(user); setShowAddModal(true); };
  const handleView = (user) => setViewingUser(user);
  const handleModalClose = () => { setShowAddModal(false); setEditingUser(null); };

  const renderView = () => {
    switch (activeNav) {
      case 'signup-approvals': return (
        <SignupApprovalsView
          approvals={approvals}
          setApprovals={setApprovals}
          roles={roles}
          setRoles={setRoles}
        />
      );
      case 'courses': return <PlaceholderView title="Courses" />;
      case 'regional-offices': return <PlaceholderView title="Regional Offices" />;
      case 'access-policies': return <PlaceholderView title="Access Policies" />;
      case 'audit-log': return <PlaceholderView title="Audit Log" />;
      default: return <UsersView onAdd={handleAdd} onEdit={handleEdit} onView={handleView} />;
    }
  };

  return (
    <main style={{ display: 'flex', background: 'var(--pgn-color-theme-bg-gray)', minHeight: '100vh' }}>

      {/* Sidebar */}
      <aside style={{ width: '240px', flexShrink: 0, background: '#fff', borderRight: '1px solid var(--pgn-color-border)', padding: '24px 12px' }}>
        {NAV_SECTIONS.map(section => (
          <div key={section.id}>
            <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', margin: '16px 0 6px' }}>
              {section.title}
            </p>
            {section.items.map(item => {
              const active = activeNav === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setActiveNav(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', width: '100%', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13.5px', fontWeight: active ? 600 : 400, background: active ? 'var(--pgn-color-primary-light)' : 'transparent', color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-gray-700)', textAlign: 'left', marginBottom: '2px' }}>
                  <FontAwesomeIcon icon={item.icon} style={{ width: '15px', opacity: 0.8, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.id === 'signup-approvals' && approvals.length > 0 && (
                    <Badge variant="danger">{approvals.length}</Badge>
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
          editUser={editingUser}
          onSubmit={() => {}}
        />
      )}
      {viewingUser && (
        <ViewUserModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
          onEdit={(user) => { setViewingUser(null); handleEdit(user); }}
        />
      )}
    </main>
  );
};

export default AdminConsolePage;
