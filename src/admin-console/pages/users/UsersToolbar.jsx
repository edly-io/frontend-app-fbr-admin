import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import messages from './messages';
import './users-styles.scss';

/**
 * Breadcrumb + title + subtitle + Import/Add User buttons for the Users page.
 */
const UsersToolbar = ({ onImport, onAdd }) => {
  const intl = useIntl();

  return (
    <>
      <Breadcrumb leaf={intl.formatMessage(messages.breadcrumbLeaf)} />
      <div className="d-flex justify-content-between align-items-start mb-1">
        <h1 className="h3 fw-bold mb-0">
          {intl.formatMessage(messages.pageTitle)}
        </h1>
        <div className="users-page__header-actions">
          <Button variant="outline-primary" size="sm" onClick={onImport}>
            <FontAwesomeIcon icon={faUpload} className="mr-2" />
            {intl.formatMessage(messages.importButton)}
          </Button>
          <Button variant="primary" size="sm" onClick={onAdd}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            {intl.formatMessage(messages.addUserButton)}
          </Button>
        </div>
      </div>
      <p className="users-page__subtitle small mb-4">
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
