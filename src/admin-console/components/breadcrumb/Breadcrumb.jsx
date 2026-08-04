import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../messages';
import './breadcrumb-styles.scss';

/**
 * Shared "Administration / <leaf>" breadcrumb rendered above every admin
 * console page, factored out of the per-view markup that used to be
 * duplicated across the Users / Signup Approvals / Biodata Edit Requests /
 * Placeholder views in the monolith.
 */
const Breadcrumb = ({ leaf }) => {
  const intl = useIntl();

  return (
    <p className="admin-breadcrumb mb-3">
      <span>{intl.formatMessage(messages.breadcrumbAdministration)}</span>
      <span className="admin-breadcrumb__divider mx-2">/</span>
      <span className="admin-breadcrumb__leaf">{leaf}</span>
    </p>
  );
};

Breadcrumb.propTypes = { leaf: PropTypes.string.isRequired };

export default Breadcrumb;
