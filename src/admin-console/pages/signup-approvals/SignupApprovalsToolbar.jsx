import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import messages from './messages';
import './signup-approvals-styles.scss';

const SignupApprovalsToolbar = ({ onRefresh }) => {
  const intl = useIntl();

  return (
    <>
      <Breadcrumb leaf={intl.formatMessage(messages.breadcrumbLeaf)} />
      <div className="d-flex justify-content-between align-items-start mb-1">
        <h1 className="h3 fw-bold mb-0">
          {intl.formatMessage(messages.pageTitle)}
        </h1>
        <Button variant="outline-secondary" size="sm" onClick={onRefresh} className="mt-1">
          <FontAwesomeIcon icon={faSync} className="mr-2" />
          {intl.formatMessage(messages.refresh)}
        </Button>
      </div>
      <p className="signup-approvals-page__subtitle small mb-4">
        {intl.formatMessage(messages.pageSubtitle)}
      </p>
    </>
  );
};

SignupApprovalsToolbar.propTypes = { onRefresh: PropTypes.func.isRequired };

export default SignupApprovalsToolbar;
