import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import DebouncedSearchInput from '../../components/debounced-search-input/DebouncedSearchInput';
import { STATUS_FILTER_OPTIONS } from './constants';
import messages from './messages';
import './users-styles.scss';

const TAB_LABEL_MESSAGES = {
  all: messages.tabAll,
  'super-admins': messages.tabSuperAdmins,
  'middle-admins': messages.tabMiddleAdmins,
  'data-admins': messages.tabDataAdmins,
  instructors: messages.tabInstructors,
  trainees: messages.tabTrainees,
};

/**
 * Role tabs, search box, status filter dropdown and result count for the
 * Users page. `tabCounts` mirrors the original behavior of only ever showing
 * a count badge (server-side total) on the currently active tab and a dash
 * on every other tab.
 */
const UsersFilters = ({
  visibleTabs,
  activeTab,
  tabCounts,
  onTabChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  batchFilter,
  onBatchFilterChange,
  batchOptions,
  countLabel,
}) => {
  const intl = useIntl();
  const selectedStatusLabel = STATUS_FILTER_OPTIONS
    .find(option => option.value === statusFilter)?.label ?? statusFilter;
  const selectedBatchLabel = batchFilter
    ? batchOptions.find(b => String(b.id) === String(batchFilter))?.name ?? batchFilter
    : intl.formatMessage(messages.batchFilterAll);

  return (
    <>
      <div className="users-filters__tabs">
        {visibleTabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`users-filters__tab ${active ? 'users-filters__tab--active' : ''}`}
            >
              {intl.formatMessage(TAB_LABEL_MESSAGES[tab.id])}
              <span className={`users-filters__tab-badge ${active ? 'users-filters__tab-badge--active' : ''}`}>
                {tabCounts[tab.id] ?? intl.formatMessage(messages.emptyValue)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="users-filters__row d-flex flex-wrap align-items-center">
        <div className="users-filters__search">
          <DebouncedSearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
          />
        </div>
        <div className="users-filters__controls d-flex align-items-center justify-content-between">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="status-filter" className="users-filters__status-toggle">
              {intl.formatMessage(messages.statusFilterLabel, { status: selectedStatusLabel })}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {STATUS_FILTER_OPTIONS.map(option => (
                <Dropdown.Item key={option.value} onClick={() => onStatusFilterChange(option.value)}>
                  {option.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown className="ml-2">
            <Dropdown.Toggle variant="outline-secondary" id="batch-filter" className="users-filters__status-toggle">
              {intl.formatMessage(messages.batchFilterLabel, { batch: selectedBatchLabel })}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => onBatchFilterChange('')}>
                {intl.formatMessage(messages.batchFilterAll)}
              </Dropdown.Item>
              {batchOptions.map(batch => (
                <Dropdown.Item
                  key={batch.id}
                  onClick={() => onBatchFilterChange(String(batch.id))}
                >
                  {batch.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <span className="users-filters__count">
            {countLabel}
          </span>
        </div>
      </div>
    </>
  );
};

UsersFilters.propTypes = {
  visibleTabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  })).isRequired,
  activeTab: PropTypes.string.isRequired,
  tabCounts: PropTypes.objectOf(PropTypes.number).isRequired,
  onTabChange: PropTypes.func.isRequired,
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
  batchFilter: PropTypes.string,
  onBatchFilterChange: PropTypes.func,
  batchOptions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  })),
  countLabel: PropTypes.node.isRequired,
};

UsersFilters.defaultProps = {
  batchFilter: '',
  onBatchFilterChange: () => {},
  batchOptions: [],
};

export default UsersFilters;
