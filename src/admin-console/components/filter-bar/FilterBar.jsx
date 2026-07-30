import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@openedx/paragon';
import './filter-bar-styles.scss';

/**
 * Generic, config-driven filter row shared by the Overview and Reports
 * pages. Each entry in `filters` renders as an independent labeled select;
 * callers own the state, options and change handlers, so this component has
 * no knowledge of what a given filter means and no strings of its own -
 * every label/option must already be intl-resolved by the caller. New
 * filters (e.g. date range, category, department) can be added later by
 * simply appending another entry to the `filters` array.
 */
const FilterBar = ({ filters }) => (
  <div className="filter-bar d-flex flex-wrap align-items-end gap-3 py-3">
    {filters.map(filter => (
      <Form.Group key={filter.id} className="filter-bar__group mb-0">
        <Form.Label className="filter-bar__label text-uppercase mb-1">
          {filter.label}
        </Form.Label>
        <Form.Control
          as="select"
          value={filter.value}
          onChange={e => filter.onChange(e.target.value)}
        >
          {filter.options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Form.Control>
      </Form.Group>
    ))}
  </div>
);

FilterBar.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })).isRequired,
    onChange: PropTypes.func.isRequired,
  })).isRequired,
};

export default FilterBar;
