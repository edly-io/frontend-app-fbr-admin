import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../messages';

const PlaceholderPage = ({ title }) => {
  const intl = useIntl();

  return (
    <>
      <p style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', marginBottom: '14px' }}>
        <span>{intl.formatMessage(messages.breadcrumbAdministration)}</span>
        <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--pgn-color-gray-800)', fontWeight: 500 }}>{title}</span>
      </p>
      <h1 style={{
        fontSize: '22px', fontWeight: 700, color: 'var(--pgn-color-text-base)', marginBottom: '24px',
      }}
      >{title}
      </h1>
      <div style={{
        background: '#fff', borderRadius: '10px', border: '1px solid var(--pgn-color-border)', padding: '56px 32px', textAlign: 'center',
      }}
      >
        <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '15px', margin: 0 }}>
          {intl.formatMessage(messages.placeholderBody)}
        </p>
      </div>
    </>
  );
};

PlaceholderPage.propTypes = { title: PropTypes.string.isRequired };

export default PlaceholderPage;
