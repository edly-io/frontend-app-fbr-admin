import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import MeterBar from './MeterBar';
import SectionState from './SectionState';
import SegmentedBar from './SegmentedBar';
import {
  ATTENDANCE_AT_RISK, ATTENDANCE_COLORS, getAttendanceBandColor,
} from './constants';
import messages from './messages';

/** Shown instead of a rate the backend reports as `null` - nothing occurred yet. */
const NO_VALUE = '—';

// The four states every expected (session, trainee) pair resolves to, in the
// order they read best: what happened, then what did not, then what nobody
// recorded.
const STATES = [
  { id: 'present', message: messages.statePresent },
  { id: 'absent', message: messages.stateAbsent },
  { id: 'leave', message: messages.stateOnLeave },
  { id: 'pending', message: messages.statePending },
];

const AttendanceOverview = ({ attendance, isLoading, isError }) => {
  const intl = useIntl();
  const sectionName = intl.formatMessage(messages.attendanceTitle);

  const stateLabel = id => intl.formatMessage(STATES.find(state => state.id === id).message);

  // Shares of the pairs actually expected, so the bar and the split always add
  // to 100 - the API reports counts, and the rate alone would not fill it.
  const breakdown = STATES.map(state => ({
    id: state.id,
    count: attendance?.[state.id] || 0,
    percentage: attendance?.total ? ((attendance[state.id] || 0) / attendance.total) * 100 : 0,
  }));

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

  const programs = attendance?.programs || [];

  return (
    <section className="dashboard-section h-100" aria-labelledby="dashboard-attendance-heading">
      <Card className="dashboard-card h-100">
        <div className="dashboard-card__header d-flex align-items-baseline">
          <h2 className="dashboard-card__title mb-0" id="dashboard-attendance-heading">
            {sectionName}
          </h2>
          <span className="dashboard-card__subtitle">
            {intl.formatMessage(messages.attendanceSubtitle)}
          </span>
        </div>

        <Card.Section className="dashboard-card__body">
          <SectionState
            section={sectionName}
            isLoading={isLoading}
            isError={isError}
            isEmpty={Boolean(attendance) && attendance.total === 0}
            emptyMessage={intl.formatMessage(messages.attendanceEmpty)}
          >
            <div className="dashboard-attendance__top d-flex align-items-end flex-wrap">
              <div>
                <p className="dashboard-figure mb-0">
                  {attendance?.rate === null
                    ? <span aria-hidden="true">{NO_VALUE}</span>
                    : attendance?.rate.toFixed(1)}
                  {attendance?.rate !== null && <small className="dashboard-figure__unit">%</small>}
                </p>
                <p className="dashboard-figure__caption mb-0">
                  {intl.formatMessage(messages.attendanceCaption, { total: attendance?.total })}
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
                const isAtRisk = program.rate !== null && program.rate < ATTENDANCE_AT_RISK;
                return (
                  <li className="dashboard-row" key={program.id}>
                    <span className="dashboard-row__label">{program.name}</span>
                    <MeterBar
                      percentage={program.rate || 0}
                      color={getAttendanceBandColor(program.rate || 0)}
                      className="dashboard-row__meter"
                    />
                    <span
                      className={`dashboard-row__value${isAtRisk ? ' dashboard-row__value--alert' : ''}`}
                    >
                      {program.rate === null
                        ? intl.formatMessage(messages.attendanceProgramNotStarted)
                        : intl.formatMessage(messages.attendanceProgramValue, {
                          percentage: program.rate,
                        })}
                      {isAtRisk && (
                        <span className="sr-only">
                          {` ${intl.formatMessage(messages.attendanceBelowThresholdNote, {
                            threshold: ATTENDANCE_AT_RISK,
                          })}`}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* The list is a ranked sample the API caps, not a breakdown of the
                headline, so it says how much it is leaving out. */}
            {attendance?.totalPrograms > programs.length && (
              <p className="dashboard-attendance__note mb-0">
                {intl.formatMessage(messages.attendanceProgramsCapped, {
                  shown: programs.length,
                  total: attendance.totalPrograms,
                })}
              </p>
            )}
          </SectionState>
        </Card.Section>
      </Card>
    </section>
  );
};

AttendanceOverview.propTypes = {
  /** `null` until `GET /fbr/api/reports/dashboard/attendance/` resolves. */
  attendance: PropTypes.shape({
    present: PropTypes.number.isRequired,
    absent: PropTypes.number.isRequired,
    leave: PropTypes.number.isRequired,
    pending: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    /** `null` where no session has occurred yet. */
    rate: PropTypes.number,
    totalPrograms: PropTypes.number.isRequired,
    programs: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      rate: PropTypes.number,
    })).isRequired,
  }),
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
};

AttendanceOverview.defaultProps = {
  attendance: null,
  isLoading: false,
  isError: false,
};

export default AttendanceOverview;
