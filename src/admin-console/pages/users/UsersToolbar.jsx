import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, StatefulButton } from '@openedx/paragon';
import { SpinnerSimple } from '@openedx/paragon/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faUpload, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import { useBulkImportJob, useBulkImportJobs } from '../../data/apiHooks';
import isBulkImportJobActive from '../../data/bulkImportJob';
import messages from './messages';
import './users-styles.scss';

/**
 * Breadcrumb + title + subtitle + Import/Recent imports/Add User buttons for the Users page.
 * While one of the admin's imports runs, Import says so and cannot start another.
 * The list is read once to find a running import; that import is then followed
 * by id, the same query the Import dialog polls.
 */
const UsersToolbar = ({ onRecentImports, onImport, onAdd }) => {
  const intl = useIntl();
  const { data: recentImports = [] } = useBulkImportJobs();
  const activeImportId = recentImports.find(isBulkImportJobActive)?.id;
  const { data: activeImport } = useBulkImportJob(activeImportId);
  const isImportRunning = Boolean(activeImportId) && (!activeImport || isBulkImportJobActive(activeImport));

  return (
    <>
      <Breadcrumb leaf={intl.formatMessage(messages.breadcrumbLeaf)} />
      <div className="d-flex justify-content-between align-items-start mb-1">
        <h1 className="h3 fw-bold mb-0">
          {intl.formatMessage(messages.pageTitle)}
        </h1>
        <div className="users-page__header-actions">
          <StatefulButton
            variant="outline-primary"
            size="sm"
            state={isImportRunning ? 'pending' : 'default'}
            disabledStates={['pending']}
            labels={{
              default: intl.formatMessage(messages.importButton),
              pending: intl.formatMessage(messages.importRunningButton),
            }}
            icons={{
              default: <FontAwesomeIcon icon={faUpload} />,
              pending: <Icon src={SpinnerSimple} className="icon-spin" />,
            }}
            onClick={onImport}
          />
          <Button variant="outline-primary" size="sm" onClick={onRecentImports}>
            <FontAwesomeIcon icon={faHistory} className="mr-2" />
            {intl.formatMessage(messages.recentImportsButton)}
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
  onRecentImports: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default UsersToolbar;
