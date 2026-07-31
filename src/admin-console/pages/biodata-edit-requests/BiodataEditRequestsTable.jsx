import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import UserIdentity from '../../shared/UserIdentity';
import RequestStatusBadge from '../../components/RequestStatusBadge';
import PaginationFooter from '../../components/PaginationFooter';
import { getInitials } from '../../data/api';
import messages from './messages';

const formatDateTime = value => (value ? new Date(value).toLocaleString() : null);

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
    <div style={{
      background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', overflow: 'hidden',
    }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
        <thead>
          <tr style={{ background: 'var(--pgn-color-gray-100)', borderBottom: '1px solid var(--pgn-color-border)' }}>
            {columns.map(label => (
              <th
                key={label}
                style={{
                  padding: '11px 16px', textAlign: label === intl.formatMessage(messages.columnAction) ? 'center' : 'left', fontSize: '11px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.06em',
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
          {!isLoading && requests.length === 0 && (
            <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pgn-color-text-light)' }}>{intl.formatMessage(messages.emptyState)}</td></tr>
          )}
          {!isLoading && requests.map((request, idx) => (
            <tr key={request.id} style={{ borderBottom: idx < requests.length - 1 ? '1px solid var(--pgn-color-gray-100)' : 'none', verticalAlign: 'top' }}>
              <td style={{ padding: '14px 16px', minWidth: '150px' }}>
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
              <td style={{
                padding: '14px 16px', color: 'var(--pgn-color-gray-700)', maxWidth: '320px', whiteSpace: 'pre-wrap',
              }}
              >
                {request.message}
              </td>
              <td style={{ padding: '14px 16px' }}><RequestStatusBadge status={request.status} /></td>
              <td style={{ padding: '14px 16px', color: 'var(--pgn-color-gray-700)', minWidth: '130px' }}>
                {formatDateTime(request.created_at) || intl.formatMessage(messages.unknownDate)}
              </td>
              <td style={{ padding: '14px 16px', color: 'var(--pgn-color-gray-700)' }}>
                {request.resolved_by_name ? (
                  <UserIdentity
                    name={request.resolved_by_name}
                    badges={[intl.formatMessage(messages.badgeAdmin)]}
                    size="compact"
                    avatarValue={getInitials(request.resolved_by_name)}
                  />
                ) : intl.formatMessage(messages.unknownDate)}
              </td>
              <td style={{ padding: '14px 16px', minWidth: '220px' }}>
                {request.status === 'pending' ? (
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={adminNotes[request.id] || ''}
                    placeholder={intl.formatMessage(messages.adminNotePlaceholder)}
                    onChange={event => onAdminNoteChange(request.id, event.target.value)}
                  />
                ) : (
                  <span style={{ color: 'var(--pgn-color-gray-700)', whiteSpace: 'pre-wrap' }}>
                    {request.admin_note || intl.formatMessage(messages.unknownDate)}
                  </span>
                )}
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'center', minWidth: '120px' }}>
                {request.status === 'pending' ? (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => onResolve(request.id)}
                    disabled={resolvingId === request.id}
                  >
                    <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px', marginRight: '6px' }} />
                    {resolvingId === request.id
                      ? intl.formatMessage(messages.resolving)
                      : intl.formatMessage(messages.resolveButton)}
                  </Button>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--pgn-color-text-light)' }}>
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
