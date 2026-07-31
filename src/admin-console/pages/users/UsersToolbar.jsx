import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import messages from './messages';

/**
 * Breadcrumb + title + subtitle + Import/Add User buttons for the Users page.
 */
const UsersToolbar = ({ onImport, onAdd }) => {
  const intl = useIntl();

  return (
    <>
      <Breadcrumb leaf={intl.formatMessage(messages.breadcrumbLeaf)} />
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
        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
          <Button variant="outline-primary" size="sm" onClick={onImport}>
            <FontAwesomeIcon icon={faUpload} style={{ marginRight: '6px' }} />
            {intl.formatMessage(messages.importButton)}
          </Button>
          <Button variant="primary" size="sm" onClick={onAdd}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '6px' }} />
            {intl.formatMessage(messages.addUserButton)}
          </Button>
        </div>
      </div>
      <p style={{ color: 'var(--pgn-color-text-light)', fontSize: '13.5px', marginBottom: '22px' }}>
        {intl.formatMessage(messages.pageSubtitle)}
      </p>
    </>
  );
};

UsersToolbar.propTypes = {
  onImport: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default UsersToolbar;
