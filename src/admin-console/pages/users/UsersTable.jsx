import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import UserIdentity from '../../components/UserIdentity';
import StatusBadge from '../../components/status-badge/StatusBadge';
import ActionMenu from '../../components/action-menu/ActionMenu';
import PaginationFooter from '../../components/pagination-footer/PaginationFooter';
import messages from './messages';
import '../../../assets/scss/admin-table-styles.scss';

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
    <div className="admin-table__wrapper">
      <table className="admin-table">
        <thead>
          <tr className="admin-table__head-row">
            {columns.map(({ label, width }) => (
              <th
                key={label}
                style={width ? { width } : undefined}
                className={`admin-table__head-cell ${label === intl.formatMessage(messages.columnActions) ? 'admin-table__head-cell--center' : ''}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td colSpan={7} className="admin-table__empty-cell">{intl.formatMessage(messages.loading)}</td></tr>
          )}
          {!isLoading && pageUsers.length === 0 && (
            <tr><td colSpan={7} className="admin-table__empty-cell">{intl.formatMessage(messages.emptyState)}</td></tr>
          )}
          {!isLoading && pageUsers.map((user, idx) => (
            <tr key={user.id} className="admin-table__body-row">
              <td className="admin-table__cell admin-table__cell--index">{rowNumberOffset + idx + 1}</td>
              <td className="admin-table__cell">
                <UserIdentity
                  name={user.name}
                  badges={[user.role].filter(Boolean)}
                  size="compact"
                  avatarValue={user.photo || user.initials}
                />
              </td>
              <td className="admin-table__cell admin-table__cell--link">{user.email}</td>
              <td className="admin-table__cell admin-table__cell--muted">{user.batchNo || intl.formatMessage(messages.emptyValue)}</td>
              <td className="admin-table__cell admin-table__cell--muted">{user.mobile || intl.formatMessage(messages.emptyValue)}</td>
              <td className="admin-table__cell"><StatusBadge status={user.status} /></td>
              <td className="admin-table__cell">
                <div className="admin-table__cell--actions">
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
