import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import biodataMessages from '../../pages/biodata-edit-requests/messages';
import './request-status-badge-styles.scss';

const RequestStatusBadge = ({ status }) => {
  const intl = useIntl();
  const isPending = status === 'pending';
  return (
    <span className={`request-status-badge ${isPending ? '' : 'request-status-badge--resolved'}`}>
      <span className="request-status-badge__dot" />
      {isPending
        ? intl.formatMessage(biodataMessages.statusPending)
        : intl.formatMessage(biodataMessages.statusResolved)}
    </span>
  );
};

RequestStatusBadge.propTypes = { status: PropTypes.string.isRequired };

export default RequestStatusBadge;
