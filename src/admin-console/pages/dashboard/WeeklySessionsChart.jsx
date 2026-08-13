import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

/**
 * Weekly training hours as eight proportional bars, each labelled with its
 * hours and with the current week emphasised.
 *
 * Plain markup and CSS rather than a charting library: the shape is eight
 * rectangles with no axes, gridlines or legend, which a flex row of elements
 * draws exactly and at a fraction of the weight. Colour and size live in the
 * stylesheet; only the data-driven height is set inline.
 *
 * The wrapper is one labelled image: `label` names every value for assistive
 * technology, so the per-bar figures inside it are presentation. Hovering a
 * week reveals its exact hours and week-commencing date in a tooltip, since the
 * printed figure is rounded to keep the bars narrow.
 */

/**
 * Floor for a week that had *some* delivery, as a share of the tallest bar. A
 * week with a single short session would otherwise round to a hairline and read
 * as nothing delivered.
 */
const MIN_VISIBLE_PERCENTAGE = 8;

const WEEK_DATE_FORMAT = { day: '2-digit', month: 'short' };

const getBarHeight = (hours, peakHours) => {
  if (!hours || !peakHours) {
    // A zero week keeps only the baseline stub the stylesheet's `min-height`
    // draws, so an empty week is visibly empty rather than missing.
    return 0;
  }
  return Math.max((hours / peakHours) * 100, MIN_VISIBLE_PERCENTAGE);
};

/**
 * `week_start` is a plain `YYYY-MM-DD` day, so it is parsed as local midnight.
 * `new Date('2026-08-10')` would be parsed as UTC and could render as the 9th
 * for anyone west of Greenwich.
 */
const parseWeekStart = weekStart => (weekStart ? new Date(`${weekStart}T00:00:00`) : null);

const WeeklySessionsChart = ({ weeks, label }) => {
  const intl = useIntl();
  const peakHours = Math.max(0, ...weeks.map(week => week.hours));
  const currentWeekIndex = weeks.length - 1;

  return (
    <div className="dashboard-weekly-chart" role="img" aria-label={label}>
      {weeks.map((week, index) => {
        const isCurrentWeek = index === currentWeekIndex;
        const weekStart = parseWeekStart(week.weekStart);
        const modifier = isCurrentWeek ? ' dashboard-weekly-chart__week--current' : '';

        return (
          <div
            className={`dashboard-weekly-chart__week${modifier}`}
            key={week.weekStart || index}
            title={weekStart
              ? intl.formatMessage(messages.sessionsWeekTooltip, {
                date: intl.formatDate(weekStart, WEEK_DATE_FORMAT),
                hours: week.hours,
              })
              : undefined}
          >
            <span className="dashboard-weekly-chart__track">
              <span
                className="dashboard-weekly-chart__bar"
                style={{ height: `${getBarHeight(week.hours, peakHours)}%` }}
              />
            </span>
            <span className="dashboard-weekly-chart__value">
              {Math.round(week.hours)}
            </span>
          </div>
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
  /** Names every value for assistive technology - the bars themselves are presentation. */
  label: PropTypes.string.isRequired,
};

export default WeeklySessionsChart;
