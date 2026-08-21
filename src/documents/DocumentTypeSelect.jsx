import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';
import { createDocumentType, listDocumentTypes } from './api';

const formatCreateLabel = (inputValue) => (
  <span>
    <strong style={{ color: '#0a58ca' }}>+ Add new type: </strong>
    <em>&ldquo;{inputValue}&rdquo;</em>
  </span>
);

const isValidNewOption = (inputValue, _, options) => {
  const trimmed = inputValue.trim().toLowerCase();
  if (!trimmed) { return false; }
  return !options.some(opt => opt.label.toLowerCase() === trimmed);
};

const DocumentTypeSelect = ({
  value, onChange, inputId, isDisabled,
}) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTypes = useCallback(async () => {
    try {
      const { data } = await listDocumentTypes();
      setOptions((Array.isArray(data) ? data : []).map(t => ({ value: t.id, label: t.name })));
    } catch {
      /* silently ignore — user can still type a new type */
    }
  }, []);

  useEffect(() => { loadTypes(); }, [loadTypes]);

  const handleCreate = async (inputValue) => {
    setIsLoading(true);
    try {
      const { data: newType } = await createDocumentType(inputValue.trim());
      const newOption = { value: newType.id, label: newType.name };
      setOptions(prev => [...prev, newOption].sort((a, b) => a.label.localeCompare(b.label)));
      onChange(newOption);
    } catch {
      /* if creation fails we just do nothing */
    } finally {
      setIsLoading(false);
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '38px',
      borderColor: '#ced4da',
      boxShadow: 'none',
      '&:hover': { borderColor: '#adb5bd' },
    }),
    menu: (base) => ({ ...base, zIndex: 1050 }),
  };

  return (
    <CreatableSelect
      inputId={inputId}
      options={options}
      value={value}
      onChange={onChange}
      onCreateOption={handleCreate}
      isLoading={isLoading}
      isDisabled={isDisabled}
      isClearable
      placeholder="Select or create a type…"
      formatCreateLabel={formatCreateLabel}
      isValidNewOption={isValidNewOption}
      styles={selectStyles}
    />
  );
};

DocumentTypeSelect.propTypes = {
  value: PropTypes.shape({ value: PropTypes.string, label: PropTypes.string }),
  onChange: PropTypes.func.isRequired,
  inputId: PropTypes.string,
  isDisabled: PropTypes.bool,
};

DocumentTypeSelect.defaultProps = {
  value: null,
  inputId: 'document-type-select',
  isDisabled: false,
};

export default DocumentTypeSelect;
