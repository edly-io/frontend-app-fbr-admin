import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { STAT_LABEL_MESSAGE_KEYS } from './constants';
import messages from './messages';

const ACCENT_COUNT = 3;

const ReportStatCard = ({ statKey, value, accentIndex }) => {
  const intl = useIntl();
  const labelKey = STAT_LABEL_MESSAGE_KEYS[statKey];

  return (
    <Card className={`report-stat-card${accentIndex ? ` report-stat-card--accent-${accentIndex}` : ''}`}>
      <Card.Section>
        <p className="report-stat-card__label text-uppercase mb-2">
          {labelKey ? intl.formatMessage(messages[labelKey]) : statKey}
        </p>
        <p className="report-stat-card__value mb-0">
          {value}
        </p>
      </Card.Section>
    </Card>
  );
};

ReportStatCard.propTypes = {
  statKey: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  accentIndex: PropTypes.number.isRequired,
};

/**
 * Row of KPI cards summarizing the currently selected report's `stats`
 * tuples (`[statKey, value]`), computed dynamically from the filtered rows
 * rather than hardcoded per report type.
 */
const ReportStatCards = ({ stats }) => (
  <div className="row g-3 mb-3">
    {stats.map(([statKey, value], index) => (
      <div className="col-12 col-sm-6 col-lg-4" key={statKey}>
        <ReportStatCard statKey={statKey} value={value} accentIndex={index % ACCENT_COUNT} />
      </div>
    ))}
  </div>
);

ReportStatCards.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  ).isRequired,
};

export default ReportStatCards;
