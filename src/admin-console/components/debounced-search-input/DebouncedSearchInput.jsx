import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import './debounced-search-input-styles.scss';

const DebouncedSearchInput = ({
  value,
  onChange,
  delay,
  placeholder,
  width,
}) => {
  const intl = useIntl();
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onChange(localValue);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, localValue, onChange]);

  return (
    <div className="debounced-search-input">
      <span
        aria-hidden="true"
        className="debounced-search-input__icon"
      >
        <span className="debounced-search-input__icon-handle" />
      </span>
      <Form.Control
        type="text"
        placeholder={placeholder ?? intl.formatMessage(messages.defaultSearchPlaceholder)}
        value={localValue}
        onChange={event => setLocalValue(event.target.value)}
        className="debounced-search-input__control"
        style={{ width }}
      />
    </div>
  );
};

DebouncedSearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  delay: PropTypes.number,
  placeholder: PropTypes.string,
  width: PropTypes.string,
};

DebouncedSearchInput.defaultProps = {
  delay: 350,
  placeholder: undefined,
  width: '340px',
};

export default DebouncedSearchInput;
