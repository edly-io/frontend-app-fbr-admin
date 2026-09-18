import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, DataTable, Form } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import UserIdentity from '../../components/UserIdentity';
import RequestStatusBadge from '../../components/request-status-badge/RequestStatusBadge';
import PaginationFooter from '../../components/pagination-footer/PaginationFooter';
import { getInitials } from '../../data/api';
import { formatDateTime } from '../../utils/date';
import messages from './messages';
import './biodata-edit-requests-styles.scss';

const requestShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  profile_id: PropTypes.number,
  profile_name: PropTypes.string,
  message: PropTypes.string,
  status: PropTypes.string,
  admin_note: PropTypes.string,
  resolved_by_name: PropTypes.string,
  resolved_at: PropTypes.string,
  created_at: PropTypes.string,
});

const cellShape = { row: PropTypes.shape({ original: requestShape.isRequired }).isRequired };

const ProfileCell = ({ row }) => {
  const intl = useIntl();
  const request = row.original;
  const name = request.profile_name
    || intl.formatMessage(messages.profileFallback, { profileId: request.profile_id });

  return (
    <div className="biodata-edit-requests-table__profile-cell">
      <UserIdentity
        name={name}
        badges={[intl.formatMessage(messages.badgeTrainee)]}
        size="compact"
        avatarValue={getInitials(request.profile_name || `Profile ${request.profile_id}`)}
      />
    </div>
  );
};

ProfileCell.propTypes = cellShape;

const MessageCell = ({ row }) => (
  <span className="biodata-edit-requests-table__message-cell">{row.original.message}</span>
);

MessageCell.propTypes = cellShape;

const StatusCell = ({ row }) => <RequestStatusBadge status={row.original.status} />;

StatusCell.propTypes = cellShape;

const RequestedCell = ({ row }) => {
  const intl = useIntl();

  return (
    <span className="biodata-edit-requests-table__date-cell">
      {formatDateTime(row.original.created_at) || intl.formatMessage(messages.unknownDate)}
    </span>
  );
};

RequestedCell.propTypes = cellShape;

const ResolvedByCell = ({ row }) => {
  const intl = useIntl();
  const { resolved_by_name: resolvedBy } = row.original;

  if (!resolvedBy) {
    return <span className="biodata-edit-requests-table__muted">{intl.formatMessage(messages.unknownDate)}</span>;
  }

  return (
    <UserIdentity
      name={resolvedBy}
      badges={[intl.formatMessage(messages.badgeAdmin)]}
      size="compact"
      avatarValue={getInitials(resolvedBy)}
    />
  );
};

ResolvedByCell.propTypes = cellShape;

const NoteCell = ({ row, column }) => {
  const intl = useIntl();
  const request = row.original;

  if (request.status !== 'pending') {
    return (
      <span className="biodata-edit-requests-table__muted">
        {request.admin_note || intl.formatMessage(messages.unknownDate)}
      </span>
    );
  }

  return (
    <Form.Control
      as="textarea"
      rows={2}
      className="biodata-edit-requests-table__note-cell"
      value={column.adminNotes[request.id] || ''}
      placeholder={intl.formatMessage(messages.adminNotePlaceholder)}
      onChange={event => column.onAdminNoteChange(request.id, event.target.value)}
    />
  );
};

NoteCell.propTypes = {
  ...cellShape,
  column: PropTypes.shape({
    adminNotes: PropTypes.objectOf(PropTypes.string).isRequired,
    onAdminNoteChange: PropTypes.func.isRequired,
  }).isRequired,
};

const ActionCell = ({ row, column }) => {
  const intl = useIntl();
  const request = row.original;
  const isResolving = column.resolvingId === request.id;

  return (
    <div className="biodata-edit-requests-table__action-cell">
      {request.status === 'pending' ? (
        <Button
          variant="success"
          size="sm"
          onClick={() => column.onResolve(request.id)}
          disabled={isResolving}
        >
          <FontAwesomeIcon icon={faCheck} className="biodata-edit-requests-table__resolve-icon" />
          {isResolving ? intl.formatMessage(messages.resolving) : intl.formatMessage(messages.resolveButton)}
        </Button>
      ) : (
        <span className="biodata-edit-requests-table__muted">
          {intl.formatMessage(messages.resolvedAt, {
            date: formatDateTime(request.resolved_at) || intl.formatMessage(messages.unknownDate),
          })}
        </span>
      )}
      <Button
        variant="link"
        className="biodata-edit-requests-table__history-link"
        onClick={() => column.onAuditHistory(request.id)}
      >
        History →
      </Button>
    </div>
  );
};

ActionCell.propTypes = {
  ...cellShape,
  column: PropTypes.shape({
    resolvingId: PropTypes.number,
    onResolve: PropTypes.func.isRequired,
    onAuditHistory: PropTypes.func.isRequired,
  }).isRequired,
};

const BiodataEditRequestsTable = ({
  isLoading,
  requests,
  adminNotes,
  onAdminNoteChange,
  resolvingId,
  onResolve,
  onAuditHistory,
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
    { Header: intl.formatMessage(messages.columnProfile), id: 'profile', Cell: ProfileCell },
    { Header: intl.formatMessage(messages.columnMessage), id: 'message', Cell: MessageCell },
    { Header: intl.formatMessage(messages.columnStatus), id: 'status', Cell: StatusCell },
    { Header: intl.formatMessage(messages.columnRequested), id: 'requested', Cell: RequestedCell },
    { Header: intl.formatMessage(messages.columnResolvedBy), id: 'resolvedBy', Cell: ResolvedByCell },
    {
      Header: intl.formatMessage(messages.columnAdminNote),
      id: 'adminNote',
      Cell: NoteCell,
      adminNotes,
      onAdminNoteChange,
    },
    {
      Header: intl.formatMessage(messages.columnAction),
      id: 'action',
      Cell: ActionCell,
      resolvingId,
      onResolve,
      onAuditHistory,
    },
  ], [intl, adminNotes, onAdminNoteChange, resolvingId, onResolve, onAuditHistory]);

  return (
    <div className="biodata-edit-requests-table">
      {/* Seven columns do not fit a phone; the table keeps a readable minimum
          width and this container scrolls it sideways instead of squashing. */}
      <div className="biodata-edit-requests-table__scroll">
        <DataTable
          isLoading={isLoading}
          data={requests}
          itemCount={total}
          columns={columns}
        >
          <DataTable.Table />
          <DataTable.EmptyTable content={intl.formatMessage(messages.emptyState)} />
        </DataTable>
      </div>

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        start={start}
        end={end}
        total={total}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </div>
  );
};

BiodataEditRequestsTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  requests: PropTypes.arrayOf(requestShape).isRequired,
  adminNotes: PropTypes.objectOf(PropTypes.string).isRequired,
  onAdminNoteChange: PropTypes.func.isRequired,
  resolvingId: PropTypes.number,
  onResolve: PropTypes.func.isRequired,
  onAuditHistory: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
};

BiodataEditRequestsTable.defaultProps = {
  resolvingId: null,
};

export default BiodataEditRequestsTable;
