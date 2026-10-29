import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Icon } from '@openedx/paragon';
import { Search } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import './debounced-search-input-styles.scss';

const DebouncedSearchInput = ({
  value,
  onChange,
  delay,
  placeholder,
  label,
  width,
}) => {
  const intl = useIntl();
  const resolvedPlaceholder = placeholder ?? intl.formatMessage(messages.defaultSearchPlaceholder);
  const [localValue, setLocalValue] = useState(value);
  const onChangeRef = useRef(onChange);
  const emittedValue = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    setLocalValue(value);
    emittedValue.current = value;
  }, [value]);

  // Keyed on the typed value alone: depending on `onChange` would re-arm the
  // timer on every parent render and emit a value the user never typed.
  useEffect(() => {
    if (localValue === emittedValue.current) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      emittedValue.current = localValue;
      onChangeRef.current(localValue);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, localValue]);

  return (
    <div className="debounced-search-input" style={{ '--debounced-search-input-max-width': width }}>
      <Form.Control
        type="search"
        placeholder={resolvedPlaceholder}
        aria-label={label ?? resolvedPlaceholder.replace(/(…|\.{3})$/, '')}
        value={localValue}
        onChange={event => setLocalValue(event.target.value)}
        leadingElement={<Icon src={Search} />}
      />
    </div>
  );
};

DebouncedSearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  delay: PropTypes.number,
  placeholder: PropTypes.string,
  /** Accessible name for the field; defaults to the placeholder text. */
  label: PropTypes.string,
  /** Ceiling for the field, which otherwise fills the space it is given. */
  width: PropTypes.string,
};

DebouncedSearchInput.defaultProps = {
  delay: 350,
  placeholder: undefined,
  label: undefined,
  width: '340px',
};

export default DebouncedSearchInput;
