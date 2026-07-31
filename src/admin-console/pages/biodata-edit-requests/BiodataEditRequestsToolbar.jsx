import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import messages from './messages';

const BiodataEditRequestsToolbar = ({ onRefresh }) => {
  const intl = useIntl();

  return (
    <>
      <Breadcrumb leaf={intl.formatMessage(messages.pageTitle)} />
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px',
      }}
      >
        <h1 style={{
          fontSize: '22px', fontWeight: 700, color: 'var(--pgn-color-text-base)', margin: 0,
        }}
        >
          {intl.formatMessage(messages.pageTitle)}
        </h1>
        <Button variant="outline-secondary" size="sm" onClick={onRefresh} style={{ marginTop: '2px' }}>
          <FontAwesomeIcon icon={faSync} style={{ marginRight: '6px' }} />
          {intl.formatMessage(messages.refresh)}
        </Button>
      </div>
      <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '13.5px', marginBottom: '22px' }}>
        {intl.formatMessage(messages.pageSubtitle)}
      </p>
    </>
  );
};

BiodataEditRequestsToolbar.propTypes = { onRefresh: PropTypes.func.isRequired };

export default BiodataEditRequestsToolbar;
