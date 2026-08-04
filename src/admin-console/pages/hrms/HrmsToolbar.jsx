import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import messages from './messages';

const HrmsToolbar = ({ isRefreshing, onRefresh }) => {
  const intl = useIntl();

  return (
    <>
      <Breadcrumb leaf={intl.formatMessage(messages.breadcrumbLeaf)} />

      <div className="d-flex justify-content-between align-items-start mb-1">
        <h1 className="h3 fw-bold mb-0">
          {intl.formatMessage(messages.pageTitle)}
        </h1>
        <Button variant="outline-primary" size="sm" onClick={onRefresh} disabled={isRefreshing}>
          <FontAwesomeIcon icon={faSync} className="mr-2" />
          {intl.formatMessage(messages.refresh)}
        </Button>
      </div>

      <p className="hrms-page__subtitle small mb-3">
        {intl.formatMessage(messages.pageSubtitle)}
      </p>
    </>
  );
};

HrmsToolbar.propTypes = {
  isRefreshing: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default HrmsToolbar;
