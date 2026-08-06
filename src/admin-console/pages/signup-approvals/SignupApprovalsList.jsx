import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import UserIdentity from '../../components/UserIdentity';
import PaginationFooter from '../../components/pagination-footer/PaginationFooter';
import { getInitials } from '../../data/api';
import { formatDate } from '../../utils/date';
import messages from './messages';
import './signup-approvals-styles.scss';

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
      <div className="signup-approvals-list">
        <div className="signup-approvals-list__state">
          <p className="signup-approvals-list__state-text">
            {intl.formatMessage(messages.loading)}
          </p>
        </div>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="signup-approvals-list">
        <div className="signup-approvals-list__state">
          <p className="signup-approvals-list__state-text">
            {intl.formatMessage(messages.emptyState)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-approvals-list">
      {approvals.map((req) => {
        const name = [req.first_name, req.last_name].filter(Boolean).join(' ') || req.username;
        return (
          <div key={req.id} className="signup-approvals-list__row">
            <div className="signup-approvals-list__info">
              <UserIdentity
                name={name}
                badges={[intl.formatMessage(messages.pendingApprovalBadge)]}
                size="compact"
                avatarValue={getInitials(name)}
              />
              <p className="signup-approvals-list__meta">
                <span className="signup-approvals-list__meta-email">{req.email}</span>
                <span className="signup-approvals-list__meta-dot">·</span>
                <span>{req.username}</span>
                <span className="signup-approvals-list__meta-dot">·</span>
                <span>
                  {req.date_joined
                    ? intl.formatMessage(messages.joinedOn, { date: formatDate(req.date_joined) })
                    : intl.formatMessage(messages.unknownDate)}
                </span>
              </p>
            </div>
            <div className="signup-approvals-list__actions">
              <Button variant="success" size="sm" onClick={() => onAssign(req)}>
                <FontAwesomeIcon icon={faCheck} className="signup-approvals-list__assign-icon" />
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
