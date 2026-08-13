import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import MeterBar from './MeterBar';
import SegmentedBar from './SegmentedBar';
import { ATTENDANCE_COLORS, TONE_COLORS, getAttendanceBandColor } from './constants';
import messages from './messages';

const STATE_MESSAGES = {
  present: messages.statePresent,
  absent: messages.stateAbsent,
  onLeave: messages.stateOnLeave,
};

const AttendanceOverview = ({ attendanceMetrics, programs }) => {
  const intl = useIntl();
  const {
    present, breakdown, threshold, attendanceChange,
    traineesBelowThreshold, sessionsMarkedToday, sessionsToday, traineesTracked,
  } = attendanceMetrics;

  const stateLabel = id => intl.formatMessage(STATE_MESSAGES[id]);

  const segments = breakdown.map(state => ({
    id: state.id,
    percentage: state.percentage,
    color: ATTENDANCE_COLORS[state.id],
  }));

  const breakdownLabel = intl.formatMessage(messages.attendanceBreakdownLabel, {
    breakdown: breakdown
      .map(state => intl.formatMessage(messages.attendanceBreakdownItem, {
        state: stateLabel(state.id),
        percentage: state.percentage.toFixed(1),
      }))
      .join(', '),
  });

  const footerStats = [
    {
      id: 'belowThreshold',
      value: traineesBelowThreshold,
      color: TONE_COLORS.negative,
      label: intl.formatMessage(messages.attendanceBelowThresholdStat, { threshold }),
    },
    {
      id: 'markedToday',
      value: intl.formatMessage(messages.attendanceMarkedTodayValue, {
        marked: sessionsMarkedToday,
        total: sessionsToday,
      }),
      label: intl.formatMessage(messages.attendanceMarkedToday),
    },
    {
      id: 'traineesTracked',
      value: traineesTracked,
      label: intl.formatMessage(messages.attendanceTraineesTracked),
    },
  ];

  return (
    <section className="dashboard-section h-100" aria-labelledby="dashboard-attendance-heading">
      <Card className="dashboard-card h-100">
        <div className="dashboard-card__header d-flex align-items-baseline">
          <h2 className="dashboard-card__title mb-0" id="dashboard-attendance-heading">
            {intl.formatMessage(messages.attendanceTitle)}
          </h2>
          <span className="dashboard-card__subtitle">
            {intl.formatMessage(messages.attendanceSubtitle)}
          </span>
        </div>

        <Card.Section className="dashboard-card__body">
          <div className="dashboard-attendance__top d-flex align-items-end flex-wrap">
            <div>
              <p className="dashboard-figure mb-0">
                {present.toFixed(1)}
                <small className="dashboard-figure__unit">%</small>
              </p>
              <p className="dashboard-figure__caption mb-0">
                {intl.formatMessage(messages.attendanceCaption, {
                  change: (
                    <span className="dashboard-delta dashboard-delta--up" key="change">
                      {intl.formatMessage(messages.attendanceChange, {
                        delta: intl.formatNumber(attendanceChange, { signDisplay: 'exceptZero' }),
                      })}
                    </span>
                  ),
                })}
              </p>
            </div>

            <ul className="dashboard-attendance__split list-unstyled mb-0 d-flex flex-wrap">
              {breakdown.map(state => (
                <li className="dashboard-attendance__split-item d-flex align-items-center" key={state.id}>
                  <span
                    className="dashboard-swatch"
                    style={{ backgroundColor: ATTENDANCE_COLORS[state.id] }}
                    aria-hidden
                  />
                  <span>
                    <span className="dashboard-attendance__split-value">
                      {intl.formatMessage(messages.percentageValue, {
                        percentage: state.percentage.toFixed(1),
                      })}
                    </span>
                    <span className="dashboard-attendance__split-label">
                      {` ${stateLabel(state.id)}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <SegmentedBar
            segments={segments}
            label={breakdownLabel}
            className="dashboard-attendance__bar"
          />

          <ul className="dashboard-rows list-unstyled mb-0">
            {programs.map((program) => {
              const isBelowThreshold = program.attendance < threshold;
              return (
                <li className="dashboard-row" key={program.id}>
                  <span className="dashboard-row__label">{program.name}</span>
                  <MeterBar
                    percentage={program.attendance}
                    color={getAttendanceBandColor(program.attendance)}
                    className="dashboard-row__meter"
                  />
                  <span
                    className={`dashboard-row__value${isBelowThreshold ? ' dashboard-row__value--alert' : ''}`}
                  >
                    {intl.formatMessage(messages.attendanceProgramValue, {
                      percentage: program.attendance,
                    })}
                    {isBelowThreshold && (
                      <span className="sr-only">
                        {` ${intl.formatMessage(messages.attendanceBelowThresholdNote, { threshold })}`}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          <ul className="dashboard-attendance__footer list-unstyled row mb-0">
            {footerStats.map(stat => (
              <li className="col-12 col-sm-4 dashboard-stat-col" key={stat.id}>
                <div className="dashboard-stat">
                  <p className="dashboard-stat__value mb-0" style={stat.color && { color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="dashboard-stat__label mb-0">{stat.label}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card.Section>
      </Card>
    </section>
  );
};

AttendanceOverview.propTypes = {
  attendanceMetrics: PropTypes.shape({
    present: PropTypes.number.isRequired,
    breakdown: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired,
    })).isRequired,
    threshold: PropTypes.number.isRequired,
    attendanceChange: PropTypes.number.isRequired,
    traineesBelowThreshold: PropTypes.number.isRequired,
    sessionsMarkedToday: PropTypes.number.isRequired,
    sessionsToday: PropTypes.number.isRequired,
    traineesTracked: PropTypes.number.isRequired,
  }).isRequired,
  programs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    attendance: PropTypes.number.isRequired,
  })).isRequired,
};

export default AttendanceOverview;
