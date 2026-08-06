import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import UserIdentity from '../../components/UserIdentity';
import RequestStatusBadge from '../../components/request-status-badge/RequestStatusBadge';
import PaginationFooter from '../../components/pagination-footer/PaginationFooter';
import { getInitials } from '../../data/api';
import { formatDateTime } from '../../utils/date';
import messages from './messages';
import '../../../assets/scss/admin-table-styles.scss';
import './biodata-edit-requests-styles.scss';

const BiodataEditRequestsTable = ({
  isLoading,
  requests,
  adminNotes,
  onAdminNoteChange,
  resolvingId,
  onResolve,
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
    intl.formatMessage(messages.columnProfile),
    intl.formatMessage(messages.columnMessage),
    intl.formatMessage(messages.columnStatus),
    intl.formatMessage(messages.columnRequested),
    intl.formatMessage(messages.columnResolvedBy),
    intl.formatMessage(messages.columnAdminNote),
    intl.formatMessage(messages.columnAction),
  ];

  return (
    <div className="admin-table__wrapper admin-table__wrapper--clip biodata-edit-requests-table">
      <table className="admin-table">
        <thead>
          <tr className="admin-table__head-row">
            {columns.map(label => (
              <th
                key={label}
                className={`admin-table__head-cell ${label === intl.formatMessage(messages.columnAction) ? 'admin-table__head-cell--center' : ''}`}
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
          {!isLoading && requests.length === 0 && (
            <tr><td colSpan={7} className="admin-table__empty-cell">{intl.formatMessage(messages.emptyState)}</td></tr>
          )}
          {!isLoading && requests.map((request) => (
            <tr key={request.id} className="admin-table__body-row admin-table__body-row--top">
              <td className="admin-table__cell admin-table__cell--tight biodata-edit-requests-table__profile-cell">
                <UserIdentity
                  name={
                    request.profile_name
                    || intl.formatMessage(messages.profileFallback, { profileId: request.profile_id })
                  }
                  badges={[intl.formatMessage(messages.badgeTrainee)]}
                  size="compact"
                  avatarValue={getInitials(request.profile_name || `Profile ${request.profile_id}`)}
                />
              </td>
              <td className="admin-table__cell admin-table__cell--tight admin-table__cell--muted admin-table__cell--wrap biodata-edit-requests-table__message-cell">
                {request.message}
              </td>
              <td className="admin-table__cell admin-table__cell--tight"><RequestStatusBadge status={request.status} /></td>
              <td className="admin-table__cell admin-table__cell--tight admin-table__cell--muted biodata-edit-requests-table__date-cell">
                {formatDateTime(request.created_at) || intl.formatMessage(messages.unknownDate)}
              </td>
              <td className="admin-table__cell admin-table__cell--tight admin-table__cell--muted">
                {request.resolved_by_name ? (
                  <UserIdentity
                    name={request.resolved_by_name}
                    badges={[intl.formatMessage(messages.badgeAdmin)]}
                    size="compact"
                    avatarValue={getInitials(request.resolved_by_name)}
                  />
                ) : intl.formatMessage(messages.unknownDate)}
              </td>
              <td className="admin-table__cell admin-table__cell--tight biodata-edit-requests-table__note-cell">
                {request.status === 'pending' ? (
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={adminNotes[request.id] || ''}
                    placeholder={intl.formatMessage(messages.adminNotePlaceholder)}
                    onChange={event => onAdminNoteChange(request.id, event.target.value)}
                  />
                ) : (
                  <span className="admin-table__cell--muted admin-table__cell--wrap">
                    {request.admin_note || intl.formatMessage(messages.unknownDate)}
                  </span>
                )}
              </td>
              <td className="admin-table__cell admin-table__cell--tight admin-table__cell--center biodata-edit-requests-table__action-cell">
                {request.status === 'pending' ? (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => onResolve(request.id)}
                    disabled={resolvingId === request.id}
                  >
                    <FontAwesomeIcon icon={faCheck} className="biodata-edit-requests-table__resolve-icon" />
                    {resolvingId === request.id
                      ? intl.formatMessage(messages.resolving)
                      : intl.formatMessage(messages.resolveButton)}
                  </Button>
                ) : (
                  <span className="admin-table__resolved-note">
                    {intl.formatMessage(messages.resolvedAt, {
                      date: formatDateTime(request.resolved_at) || intl.formatMessage(messages.unknownDate),
                    })}
                  </span>
                )}
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
      />
    </div>
  );
};

BiodataEditRequestsTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  requests: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })).isRequired,
  adminNotes: PropTypes.objectOf(PropTypes.string).isRequired,
  onAdminNoteChange: PropTypes.func.isRequired,
  resolvingId: PropTypes.number,
  onResolve: PropTypes.func.isRequired,
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
