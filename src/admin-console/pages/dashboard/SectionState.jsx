import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

/**
 * Loading / error / empty wrapper shared by every API-backed dashboard section.
 *
 * Each section is backed by its own endpoint, so one that fails shows its own
 * message in place rather than taking the whole page down - the same reason the
 * backend splits the dashboard across three routes. `children` renders only
 * once there is data worth showing.
 */
const SectionState = ({
  section, isLoading, isError, isEmpty, emptyMessage, children,
}) => {
  const intl = useIntl();

  if (isLoading) {
    return (
      <div className="dashboard-state d-flex justify-content-center">
        <Spinner animation="border" screenReaderText={intl.formatMessage(messages.sectionLoading, { section })} />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="danger" className="dashboard-state__alert mb-0">
        {intl.formatMessage(messages.sectionLoadError, { section })}
      </Alert>
    );
  }

  if (isEmpty) {
    return <p className="dashboard-state__empty mb-0">{emptyMessage}</p>;
  }

  return children;
};

SectionState.propTypes = {
  /** Human-readable section name, used in the loading and error copy. */
  section: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  isEmpty: PropTypes.bool,
  emptyMessage: PropTypes.string,
  children: PropTypes.node.isRequired,
};

SectionState.defaultProps = {
  isLoading: false,
  isError: false,
  isEmpty: false,
  emptyMessage: '',
};

export default SectionState;
