import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';
import { createDocumentType, listDocumentTypes } from './api';
import './DocumentTypeSelect.css';

const formatCreateLabel = (inputValue) => (
  <span>
    <strong style={{ color: 'var(--pgn-color-primary-base)' }}>+ Add new type: </strong>
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

  // `unstyled` drops react-select's own emotion styling so the control can wear
  // Paragon's `form-control` instead. That is what keeps it identical to the
  // Title and Description inputs beside it - in both themes, and through any
  // future change to Paragon's form styling - rather than an approximation of
  // it in tokens. The menu borrows Paragon's dropdown for the same reason.
  // DocumentTypeSelect.css supplies only the layout `unstyled` took away.
  const selectClassNames = {
    container: () => 'doc-type-select',
    control: () => 'doc-type-select__control form-control',
    valueContainer: () => 'doc-type-select__value',
    placeholder: () => 'doc-type-select__placeholder',
    indicatorsContainer: () => 'doc-type-select__indicators',
    indicatorSeparator: () => 'doc-type-select__separator',
    dropdownIndicator: () => 'doc-type-select__indicator',
    clearIndicator: () => 'doc-type-select__indicator',
    menu: () => 'doc-type-select__menu dropdown-menu show',
    option: ({ isSelected, isFocused }) => [
      'doc-type-select__option dropdown-item',
      isSelected ? 'active' : '',
      isFocused && !isSelected ? 'doc-type-select__option--focused' : '',
    ].filter(Boolean).join(' '),
    noOptionsMessage: () => 'doc-type-select__message',
    loadingMessage: () => 'doc-type-select__message',
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
      unstyled
      classNames={selectClassNames}
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
