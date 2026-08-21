import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

/**
 * Loading / error / empty wrapper shared by every API-backed dashboard section,
 * so one failing endpoint shows its message in place instead of taking the whole
 * page down.
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
