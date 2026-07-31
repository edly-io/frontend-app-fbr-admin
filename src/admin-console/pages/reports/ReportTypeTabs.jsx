import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { REPORT_TABS } from './constants';
import messages from './messages';

/**
 * Pill-button switcher for the available report types. Purely presentational
 * - the caller owns `selectedReport` state and receives the chosen report id
 * via `onChange`.
 */
const ReportTypeTabs = ({ selectedReport, onChange }) => {
  const intl = useIntl();

  return (
    <div className="d-flex flex-wrap gap-2 mb-4">
      {REPORT_TABS.map(tab => {
        const active = tab.id === selectedReport;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`report-tab-pill rounded-pill py-2 px-3${active ? ' report-tab-pill--active' : ''}`}
          >
            {intl.formatMessage(messages[tab.labelKey])}
          </button>
        );
      })}
    </div>
  );
};

ReportTypeTabs.propTypes = {
  selectedReport: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ReportTypeTabs;
