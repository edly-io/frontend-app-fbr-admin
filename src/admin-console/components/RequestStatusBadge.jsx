import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import biodataMessages from '../biodata-edit-requests/messages';

const RequestStatusBadge = ({ status }) => {
  const intl = useIntl();
  const isPending = status === 'pending';
  return (
    <span style={{
      background: isPending ? '#FFF3E0' : '#EDFAF1', color: isPending ? '#B45309' : 'var(--pgn-color-green)', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px',
    }}
    >
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%', background: isPending ? '#B45309' : 'var(--pgn-color-green)', flexShrink: 0,
      }}
      />
      {isPending
        ? intl.formatMessage(biodataMessages.statusPending)
        : intl.formatMessage(biodataMessages.statusResolved)}
    </span>
  );
};

RequestStatusBadge.propTypes = { status: PropTypes.string.isRequired };

export default RequestStatusBadge;
