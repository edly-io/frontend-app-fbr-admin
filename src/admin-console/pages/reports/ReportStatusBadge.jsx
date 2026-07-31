import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getStatusTone, STATUS_LABEL_MESSAGE_KEYS } from './constants';
import messages from './messages';

/**
 * Tone-colored status pill for report rows (Completed / In progress /
 * Not started / Overdue / Scheduled), following the same dot+pill shape as
 * `components/StatusBadge.jsx` and `components/RequestStatusBadge.jsx`.
 */
const ReportStatusBadge = ({ status }) => {
  const intl = useIntl();
  const tone = getStatusTone(status);
  const labelKey = STATUS_LABEL_MESSAGE_KEYS[status];

  return (
    <span className={`report-tone-${tone} d-inline-flex align-items-center gap-2 px-2 py-1 rounded-pill text-nowrap`}>
      <span className="report-status-badge__dot rounded-circle flex-shrink-0" />
      {labelKey ? intl.formatMessage(messages[labelKey]) : status}
    </span>
  );
};

ReportStatusBadge.propTypes = { status: PropTypes.string.isRequired };

export default ReportStatusBadge;
