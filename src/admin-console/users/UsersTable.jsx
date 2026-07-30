import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import UserIdentity from '../shared/UserIdentity';
import StatusBadge from '../components/StatusBadge';
import ActionMenu from '../components/ActionMenu';
import PaginationFooter from '../components/PaginationFooter';
import messages from './messages';

const COLUMN_WIDTHS = {
  index: '52px',
  actions: '110px',
};

/**
 * Users table body + header + pagination footer. `pageUsers` is the already
 * client-side status-filtered page of results; `rowNumberOffset` is
 * `(page - 1) * rowsPerPage` so row numbers stay stable across pages.
 */
const UsersTable = ({
  isLoading,
  pageUsers,
  rowNumberOffset,
  openMenuId,
  setOpenMenuId,
  onView,
  onEdit,
  onDeactivate,
  page,
  totalPages,
  start,
  end,
  total,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const intl = useIntl();

  const columns = [
    { label: intl.formatMessage(messages.columnIndex), width: COLUMN_WIDTHS.index },
    { label: intl.formatMessage(messages.columnFullName) },
    { label: intl.formatMessage(messages.columnEmail) },
    { label: intl.formatMessage(messages.columnBatch) },
    { label: intl.formatMessage(messages.columnMobile) },
    { label: intl.formatMessage(messages.columnStatus) },
    { label: intl.formatMessage(messages.columnActions), width: COLUMN_WIDTHS.actions },
  ];

  return (
    <div style={{
      background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', overflow: 'visible',
    }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
        <thead>
          <tr style={{ background: 'var(--pgn-color-gray-100)', borderBottom: '1px solid var(--pgn-color-border)' }}>
            {columns.map(({ label, width }) => (
              <th
                key={label}
                style={{
                  padding: '11px 16px', textAlign: label === intl.formatMessage(messages.columnActions) ? 'center' : 'left', fontSize: '11px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.06em', width,
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pgn-color-text-light)' }}>{intl.formatMessage(messages.loading)}</td></tr>
          )}
          {!isLoading && pageUsers.length === 0 && (
            <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pgn-color-text-light)' }}>{intl.formatMessage(messages.emptyState)}</td></tr>
          )}
          {!isLoading && pageUsers.map((user, idx) => (
            <tr
              key={user.id}
              style={{ borderBottom: idx < pageUsers.length - 1 ? '1px solid var(--pgn-color-gray-100)' : 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--pgn-color-primary-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; }}
            >
              <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-400)', fontWeight: 500 }}>{rowNumberOffset + idx + 1}</td>
              <td style={{ padding: '12px 16px' }}>
                <UserIdentity
                  name={user.name}
                  badges={[user.role].filter(Boolean)}
                  size="compact"
                  avatarValue={user.photo || user.initials}
                />
              </td>
              <td style={{ padding: '12px 16px', color: 'var(--pgn-color-primary-base)' }}>{user.email}</td>
              <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-700)' }}>{user.batchNo || intl.formatMessage(messages.emptyValue)}</td>
              <td style={{ padding: '12px 16px', color: 'var(--pgn-color-gray-700)' }}>{user.mobile || intl.formatMessage(messages.emptyValue)}</td>
              <td style={{ padding: '12px 16px' }}><StatusBadge status={user.status} /></td>
              <td style={{ padding: '12px 16px' }}>
                <div style={{
                  display: 'flex', gap: '2px', justifyContent: 'center', alignItems: 'center',
                }}
                >
                  <Button variant="tertiary" size="sm" title={intl.formatMessage(messages.viewTooltip)} onClick={() => onView(user)}>
                    <FontAwesomeIcon icon={faEye} />
                  </Button>
                  <Button variant="tertiary" size="sm" title={intl.formatMessage(messages.editTooltip)} onClick={() => onEdit(user)}>
                    <FontAwesomeIcon icon={faPen} />
                  </Button>
                  <ActionMenu
                    userId={user.id}
                    userStatus={user.status}
                    openId={openMenuId}
                    setOpenId={setOpenMenuId}
                    onView={() => onView(user)}
                    onEdit={() => onEdit(user)}
                    onDeactivate={() => onDeactivate(user)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        start={start}
        end={end}
        total={total}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        showPageNumbers
      />
    </div>
  );
};

UsersTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  pageUsers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })).isRequired,
  rowNumberOffset: PropTypes.number.isRequired,
  openMenuId: PropTypes.number,
  setOpenMenuId: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
};

UsersTable.defaultProps = {
  openMenuId: null,
};

export default UsersTable;
