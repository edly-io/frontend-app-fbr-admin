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
  countLabel,
}) => {
  const intl = useIntl();

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

      <div className="users-filters__row">
        <div className="users-filters__search-wrap">
          <DebouncedSearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
          />
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="status-filter" className="users-filters__status-toggle">
              {intl.formatMessage(messages.statusFilterLabel, { status: statusFilter })}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {STATUS_FILTER_OPTIONS.map(status => (
                <Dropdown.Item key={status} onClick={() => onStatusFilterChange(status)}>{status}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <span className="users-filters__count">
          {countLabel}
        </span>
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
  countLabel: PropTypes.node.isRequired,
};

export default UsersFilters;
