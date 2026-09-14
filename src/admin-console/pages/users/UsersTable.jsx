import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable, Form, Icon, IconButton, Pagination,
} from '@openedx/paragon';
import { Edit, Visibility } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import UserIdentity from '../../components/UserIdentity';
import StatusBadge from '../../components/status-badge/StatusBadge';
import ActionMenu from '../../components/action-menu/ActionMenu';
import { ROWS_PER_PAGE_OPTIONS } from '../../constants';
import adminMessages from '../../messages';
import messages from './messages';
import './users-styles.scss';

const renderStrong = chunks => <strong>{chunks}</strong>;

const IndexCell = ({ row, column }) => (
  <span className="users-table__index">{column.rowNumberOffset + row.index + 1}</span>
);

IndexCell.propTypes = {
  row: PropTypes.shape({ index: PropTypes.number.isRequired }).isRequired,
  column: PropTypes.shape({ rowNumberOffset: PropTypes.number.isRequired }).isRequired,
};

const UserCell = ({ row }) => {
  const user = row.original;

  return (
    <UserIdentity
      name={user.name}
      badges={[user.role].filter(Boolean)}
      size="compact"
      avatarValue={user.photo || user.initials}
    />
  );
};

UserCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      name: PropTypes.string,
      role: PropTypes.string,
      photo: PropTypes.string,
      initials: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

const EmailCell = ({ value }) => {
  const intl = useIntl();

  return value
    ? <span className="users-table__email">{value}</span>
    : <span className="users-table__muted">{intl.formatMessage(messages.emptyValue)}</span>;
};

EmailCell.propTypes = { value: PropTypes.string };
EmailCell.defaultProps = { value: '' };

const MutedTextCell = ({ value }) => {
  const intl = useIntl();

  return (
    <span className="users-table__muted">
      {value || intl.formatMessage(messages.emptyValue)}
    </span>
  );
};

MutedTextCell.propTypes = { value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) };
MutedTextCell.defaultProps = { value: '' };

const StatusCell = ({ value }) => <StatusBadge status={value} />;

StatusCell.propTypes = { value: PropTypes.string.isRequired };

const ActionsCell = ({ row, column }) => {
  const intl = useIntl();
  const user = row.original;

  return (
    <div className="users-table__actions d-flex align-items-center">
      <IconButton
        src={Visibility}
        iconAs={Icon}
        size="sm"
        alt={intl.formatMessage(messages.viewTooltip)}
        onClick={() => column.onView(user)}
      />
      <IconButton
        src={Edit}
        iconAs={Icon}
        size="sm"
        alt={intl.formatMessage(messages.editTooltip)}
        onClick={() => column.onEdit(user)}
      />
      <ActionMenu
        userId={user.id}
        userStatus={user.status}
        openId={column.openMenuId}
        setOpenId={column.setOpenMenuId}
        onView={() => column.onView(user)}
        onEdit={() => column.onEdit(user)}
        onDeactivate={() => column.onDeactivate(user)}
      />
    </div>
  );
};

ActionsCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      status: PropTypes.string,
    }).isRequired,
  }).isRequired,
  column: PropTypes.shape({
    openMenuId: PropTypes.number,
    setOpenMenuId: PropTypes.func.isRequired,
    onView: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDeactivate: PropTypes.func.isRequired,
  }).isRequired,
};

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

  const columns = useMemo(() => [
    {
      Header: intl.formatMessage(messages.columnIndex),
      id: 'index',
      accessor: 'id',
      rowNumberOffset,
      Cell: IndexCell,
    },
    {
      Header: intl.formatMessage(messages.columnFullName),
      accessor: 'name',
      Cell: UserCell,
    },
    {
      Header: intl.formatMessage(messages.columnEmail),
      accessor: 'email',
      Cell: EmailCell,
    },
    {
      Header: intl.formatMessage(messages.columnBatch),
      accessor: 'batchNo',
      Cell: MutedTextCell,
    },
    {
      Header: intl.formatMessage(messages.columnMobile),
      accessor: 'mobile',
      Cell: MutedTextCell,
    },
    {
      Header: intl.formatMessage(messages.columnStatus),
      accessor: 'status',
      Cell: StatusCell,
    },
    {
      Header: intl.formatMessage(messages.columnActions),
      id: 'actions',
      accessor: 'id',
      cellClassName: 'users-table__actions-cell',
      openMenuId,
      setOpenMenuId,
      onView,
      onEdit,
      onDeactivate,
      Cell: ActionsCell,
    },
  ], [intl, rowNumberOffset, openMenuId, setOpenMenuId, onView, onEdit, onDeactivate]);

  return (
    <div className="users-table">
      <DataTable
        isLoading={isLoading}
        data={pageUsers}
        itemCount={total}
        columns={columns}
      >
        <DataTable.Table />
        <DataTable.EmptyTable content={intl.formatMessage(messages.emptyState)} />
      </DataTable>

      <div className="users-table__footer d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-lg-between">
        <span className="users-table__summary">
          {intl.formatMessage(adminMessages.paginationShowing, {
            start, end, total, strong: renderStrong,
          })}
        </span>
        <Pagination
          paginationLabel={intl.formatMessage(messages.paginationLabel)}
          pageCount={totalPages}
          currentPage={page}
          onPageSelect={onPageChange}
          size="small"
          variant="secondary"
        />
        <div className="users-table__rows-per-page d-flex align-items-center">
          {intl.formatMessage(adminMessages.paginationRowsPerPage)}
          <Form.Control
            as="select"
            size="sm"
            value={rowsPerPage}
            onChange={e => onRowsPerPageChange(Number(e.target.value))}
            className="users-table__rows-select"
          >
            {ROWS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </Form.Control>
        </div>
      </div>
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
