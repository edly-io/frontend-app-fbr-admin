import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import UserIdentity from '../../shared/UserIdentity';
import PaginationFooter from '../../components/PaginationFooter';
import { getInitials } from '../../data/api';
import messages from './messages';

const SignupApprovalsList = ({
  isLoading,
  approvals,
  onAssign,
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

  if (isLoading) {
    return (
      <div style={{
        background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', padding: '56px 32px', textAlign: 'center',
      }}
      >
        <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '15px', margin: 0 }}>
          {intl.formatMessage(messages.loading)}
        </p>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div style={{
        background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', padding: '56px 32px', textAlign: 'center',
      }}
      >
        <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '15px', margin: 0 }}>
          {intl.formatMessage(messages.emptyState)}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', overflow: 'hidden',
    }}
    >
      {approvals.map((req, idx) => {
        const name = [req.first_name, req.last_name].filter(Boolean).join(' ') || req.username;
        return (
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
                name={name}
                badges={[intl.formatMessage(messages.pendingApprovalBadge)]}
                size="compact"
                avatarValue={getInitials(name)}
              />
              <p style={{
                margin: '3px 0 0', fontSize: '13px', color: 'var(--pgn-color-text-light)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
              }}
              >
                <span style={{ color: 'var(--pgn-color-primary-base)' }}>{req.email}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{req.username}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>
                  {req.date_joined
                    ? intl.formatMessage(messages.joinedOn, { date: new Date(req.date_joined).toLocaleDateString() })
                    : intl.formatMessage(messages.unknownDate)}
                </span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <Button variant="success" size="sm" onClick={() => onAssign(req)}>
                <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px', marginRight: '6px' }} />
                {intl.formatMessage(messages.assignRoleButton)}
              </Button>
            </div>
          </div>
        );
      })}

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

SignupApprovalsList.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  approvals: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })).isRequired,
  onAssign: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
};

export default SignupApprovalsList;
