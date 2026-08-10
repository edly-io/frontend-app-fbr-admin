import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../messages';
import './breadcrumb-styles.scss';

/**
 * Shared "<root> / <leaf>" breadcrumb rendered above every admin
 * console page, factored out of the per-view markup that used to be
 * duplicated across the Users / Signup Approvals / Biodata Edit Requests /
 * Placeholder views in the monolith. `root` defaults to "Administration";
 * pages that belong to another section (e.g. Reports) pass their own.
 */
const Breadcrumb = ({ root, leaf }) => {
  const intl = useIntl();
  const rootLabel = root || intl.formatMessage(messages.breadcrumbAdministration);

  return (
    <p className="admin-breadcrumb mb-3">
      <span>{rootLabel}</span>
      <span className="admin-breadcrumb__divider mx-2">/</span>
      <span className="admin-breadcrumb__leaf">{leaf}</span>
    </p>
  );
};

Breadcrumb.propTypes = {
  root: PropTypes.string,
  leaf: PropTypes.string.isRequired,
};

Breadcrumb.defaultProps = {
  root: undefined,
};

export default Breadcrumb;
