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
    <nav className="admin-breadcrumb mb-3" aria-label={intl.formatMessage(messages.breadcrumbLabel)}>
      <ol className="list-unstyled d-flex flex-wrap align-items-center m-0 p-0">
        <li>
          {rootLabel}
          <span className="admin-breadcrumb__divider mx-2" aria-hidden="true">/</span>
        </li>
        <li className="admin-breadcrumb__leaf" aria-current="page">{leaf}</li>
      </ol>
    </nav>
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
