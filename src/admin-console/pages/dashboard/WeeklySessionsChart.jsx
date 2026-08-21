import React, { useId } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

/**
 * Weekly training hours as eight proportional bars. Each week is a button, so
 * hover and keyboard focus both reveal its tooltip, which carries the exact
 * hours - the printed figure is rounded to keep the bars narrow.
 */

/**
 * Floor for a week that had *some* delivery: a single short session would
 * otherwise round to a hairline and read as nothing delivered.
 */
const MIN_VISIBLE_PERCENTAGE = 8;

const WEEK_DATE_FORMAT = { day: '2-digit', month: 'short' };

const getBarHeight = (hours, peakHours) => {
  if (!hours || !peakHours) {
    return 0;
  }
  return Math.max((hours / peakHours) * 100, MIN_VISIBLE_PERCENTAGE);
};

/** Parsed as local midnight: `new Date('2026-08-10')` is UTC and can shift a day. */
const parseWeekStart = weekStart => (weekStart ? new Date(`${weekStart}T00:00:00`) : null);

/**
 * A bar does nothing when clicked, so it must not keep focus afterwards - the
 * chart would stay dimmed around a pinned bar. Tabbing to it still focuses it.
 */
const preventFocusOnClick = event => event.preventDefault();

const WeeklySessionsChart = ({ weeks, label }) => {
  const intl = useIntl();
  const chartId = useId();
  const peakHours = Math.max(0, ...weeks.map(week => week.hours));
  const currentWeekIndex = weeks.length - 1;

  return (
    <div className="dashboard-weekly-chart" role="group" aria-label={label}>
      {weeks.map((week, index) => {
        const weekStart = parseWeekStart(week.weekStart);
        const values = {
          date: weekStart ? intl.formatDate(weekStart, WEEK_DATE_FORMAT) : '',
          hours: week.hours,
        };
        const modifier = index === currentWeekIndex ? ' dashboard-weekly-chart__week--current' : '';

        return (
          <OverlayTrigger
            key={week.weekStart || index}
            placement="top"
            overlay={(
              <Tooltip id={`${chartId}-week-${index}`}>
                {intl.formatMessage(messages.sessionsWeekTooltip, values)}
              </Tooltip>
            )}
          >
            <button
              type="button"
              className={`dashboard-weekly-chart__week${modifier}`}
              aria-label={intl.formatMessage(messages.sessionsWeekAria, values)}
              onMouseDown={preventFocusOnClick}
            >
              <span className="dashboard-weekly-chart__track">
                <span
                  className="dashboard-weekly-chart__bar"
                  style={{ '--dashboard-bar-height': `${getBarHeight(week.hours, peakHours)}%` }}
                />
              </span>
              <span className="dashboard-weekly-chart__value" aria-hidden="true">
                {Math.round(week.hours)}
              </span>
            </button>
          </OverlayTrigger>
        );
      })}
    </div>
  );
};

WeeklySessionsChart.propTypes = {
  /** Delivered hours per week, oldest first; the last entry is the current week. */
  weeks: PropTypes.arrayOf(PropTypes.shape({
    weekStart: PropTypes.string,
    hours: PropTypes.number.isRequired,
  })).isRequired,
  label: PropTypes.string.isRequired,
};

export default WeeklySessionsChart;
