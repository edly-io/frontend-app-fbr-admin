import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from '@openedx/paragon';
import './filter-bar-styles.scss';

/**
 * Generic, config-driven filter row shared by the Overview and Reports
 * pages. Each entry in `filters` renders as either a labeled select (the
 * default) or, when `type: 'dateRange'` is set, a pair of "from"/"to" date
 * inputs under a single label. Callers own the state, options, change
 * handlers, and any `min`/`max` bounds (`startMax`/`endMin`/`endMax`), so
 * this component has no knowledge of what a given filter means and no
 * strings of its own - every label/option must already be intl-resolved by
 * the caller. New filter types (e.g. category, department) can be added
 * later by extending the per-entry rendering below.
 *
 * The optional "clear all" control is opt-in: pass `onClearAll` (and a
 * `clearAllLabel`) to show it. Whether it should be disabled (e.g. because
 * every filter already sits at its default value) is left to the caller via
 * `isClearAllDisabled`, since only the caller knows what "default" means.
 *
 * The optional "apply" control is opt-in the same way, via `onApply` (and an
 * `applyLabel`)/`isApplyDisabled`. Callers that want a draft/applied filter
 * pattern - editing filters without refetching until the user commits - wire
 * `value`/`startValue`/`endValue` up to their draft state and only push it
 * into their query on `onApply`.
 */
const FilterBar = ({
  filters, onClearAll, clearAllLabel, isClearAllDisabled, onApply, applyLabel, isApplyDisabled,
}) => (
  <div className="filter-bar d-flex flex-wrap align-items-end gap-3 py-3">
    {filters.map(filter => (
      <Form.Group key={filter.id} className="filter-bar__group mb-0">
        <Form.Label className="filter-bar__label text-uppercase mb-1">
          {filter.label}
        </Form.Label>
        {filter.type === 'dateRange' ? (
          <div className="filter-bar__date-range d-flex align-items-center">
            <Form.Control
              type="date"
              lang="en-GB"
              value={filter.startValue}
              max={filter.startMax}
              onChange={e => filter.onStartChange(e.target.value)}
              aria-label={filter.startLabel}
            />
            <span className="filter-bar__date-range-separator" aria-hidden="true">–</span>
            <Form.Control
              type="date"
              lang="en-GB"
              value={filter.endValue}
              min={filter.endMin}
              max={filter.endMax}
              onChange={e => filter.onEndChange(e.target.value)}
              aria-label={filter.endLabel}
            />
          </div>
        ) : (
          <Form.Control
            as="select"
            value={filter.value}
            onChange={e => filter.onChange(e.target.value)}
          >
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Form.Control>
        )}
      </Form.Group>
    ))}

    {onApply && (
      <Button
        variant="primary"
        size="sm"
        className="filter-bar__apply"
        onClick={onApply}
        disabled={isApplyDisabled}
      >
        {applyLabel}
      </Button>
    )}

    {onClearAll && (
      <Button
        variant="tertiary"
        size="sm"
        className="filter-bar__clear-all"
        onClick={onClearAll}
        disabled={isClearAllDisabled}
      >
        {clearAllLabel}
      </Button>
    )}
  </div>
);

FilterBar.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['select', 'dateRange']),
    value: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })),
    onChange: PropTypes.func,
    startValue: PropTypes.string,
    endValue: PropTypes.string,
    startLabel: PropTypes.string,
    endLabel: PropTypes.string,
    onStartChange: PropTypes.func,
    onEndChange: PropTypes.func,
    startMax: PropTypes.string,
    endMin: PropTypes.string,
    endMax: PropTypes.string,
  })).isRequired,
  onClearAll: PropTypes.func,
  clearAllLabel: PropTypes.string,
  isClearAllDisabled: PropTypes.bool,
  onApply: PropTypes.func,
  applyLabel: PropTypes.string,
  isApplyDisabled: PropTypes.bool,
};

FilterBar.defaultProps = {
  onClearAll: undefined,
  clearAllLabel: undefined,
  isClearAllDisabled: false,
  onApply: undefined,
  applyLabel: undefined,
  isApplyDisabled: false,
};

export default FilterBar;
