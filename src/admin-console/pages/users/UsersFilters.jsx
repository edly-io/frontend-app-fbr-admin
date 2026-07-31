import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import DebouncedSearchInput from '../../shared/DebouncedSearchInput';
import { STATUS_FILTER_OPTIONS } from './constants';
import messages from './messages';

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
      <div style={{ borderBottom: '2px solid var(--pgn-color-border)', marginBottom: '20px', display: 'flex' }}>
        {visibleTabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              style={{
                padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: '13.5px', fontWeight: active ? 600 : 400, color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-text-light)', background: 'transparent', borderBottom: active ? '2px solid var(--pgn-color-primary-base)' : '2px solid transparent', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
              }}
            >
              {intl.formatMessage(TAB_LABEL_MESSAGES[tab.id])}
              <span style={{
                background: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-border)', color: active ? '#fff' : 'var(--pgn-color-text-light)', borderRadius: '9px', padding: '1px 6px', fontSize: '11px', fontWeight: 600,
              }}
              >
                {tabCounts[tab.id] ?? intl.formatMessage(messages.emptyValue)}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
      }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <DebouncedSearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
          />
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="status-filter" style={{ fontSize: '13.5px' }}>
              {intl.formatMessage(messages.statusFilterLabel, { status: statusFilter })}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {STATUS_FILTER_OPTIONS.map(status => (
                <Dropdown.Item key={status} onClick={() => onStatusFilterChange(status)}>{status}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)', fontWeight: 500 }}>
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
