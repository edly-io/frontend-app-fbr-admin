import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

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
    <div style={{ position: 'relative' }}>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '11px',
          top: '50%',
          width: '11px',
          height: '11px',
          border: '1.7px solid #ADB5BD',
          borderRadius: '50%',
          transform: 'translateY(-55%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: '6px',
            height: '1.7px',
            background: '#ADB5BD',
            right: '-5px',
            bottom: '-3px',
            transform: 'rotate(45deg)',
            transformOrigin: 'left center',
          }}
        />
      </span>
      <Form.Control
        type="text"
        placeholder={placeholder ?? intl.formatMessage(messages.defaultSearchPlaceholder)}
        value={localValue}
        onChange={event => setLocalValue(event.target.value)}
        style={{ paddingLeft: '34px', width }}
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
