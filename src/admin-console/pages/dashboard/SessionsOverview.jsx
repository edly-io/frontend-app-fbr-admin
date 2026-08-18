import React from 'react';
import PropTypes from 'prop-types';
import { Card, IconButtonWithTooltip } from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import MeterBar from './MeterBar';
import SectionState from './SectionState';
import WeeklySessionsChart from './WeeklySessionsChart';
import { TONE_COLORS } from './constants';
import messages from './messages';

/** Shown instead of an average the backend reports as `null` - nothing delivered. */
const NO_VALUE = '—';

const AT_A_GLANCE = [
  { id: 'averageSessionLength', labelKey: 'statAverageSessionLength' },
  { id: 'sessionsThisWeek', labelKey: 'statSessionsThisWeek' },
  { id: 'upcomingScheduled', labelKey: 'statUpcomingScheduled' },
  { id: 'instructorsDelivering', labelKey: 'statInstructorsDelivering' },
];

const SessionsOverview = ({ sessions, isLoading, isError }) => {
  const intl = useIntl();
  const sectionName = intl.formatMessage(messages.sessionsTitle);

  const hoursByProgram = sessions?.hoursByProgram || [];
  const hoursPerWeek = sessions?.hoursPerWeek || [];
  // Every bar is drawn relative to the busiest program, so a single zero-hour
  // program can never divide by zero here.
  const maxProgramHours = Math.max(1, ...hoursByProgram.map(program => program.hours));

  const glanceValues = {
    averageSessionLength: sessions?.averageSessionHours === null
      ? { value: NO_VALUE }
      : {
        value: sessions?.averageSessionHours?.toFixed(1),
        unit: ` ${intl.formatMessage(messages.hoursUnit)}`,
      },
    sessionsThisWeek: { value: sessions?.sessionsThisWeek },
    upcomingScheduled: { value: sessions?.upcomingSessions },
    instructorsDelivering: { value: sessions?.instructorsDelivering },
  };

  const isEmpty = Boolean(sessions)
    && sessions.sessionsDelivered === 0
    && sessions.upcomingSessions === 0
    && sessions.sessionsThisWeek === 0;

  return (
    <section className="dashboard-section" aria-labelledby="dashboard-sessions-heading">
      <Card className="dashboard-card">
        <div className="dashboard-card__header d-flex align-items-baseline">
          <h2 className="dashboard-card__title mb-0" id="dashboard-sessions-heading">
            {sectionName}
          </h2>
          <span className="dashboard-card__subtitle">
            {intl.formatMessage(messages.sessionsSubtitle)}
          </span>
        </div>

        <Card.Section className="dashboard-card__body">
          <SectionState
            section={sectionName}
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            emptyMessage={intl.formatMessage(messages.sessionsEmpty)}
          >
            <>
              <div className="dashboard-sessions__top d-flex align-items-end flex-wrap">
                <div className="dashboard-sessions__headline">
                  <p className="dashboard-figure dashboard-figure--lg mb-0">
                    {sessions?.totalHours}
                    <small className="dashboard-figure__unit">
                      {` ${intl.formatMessage(messages.hoursUnit)}`}
                    </small>
                  </p>
                  <p className="dashboard-figure__caption mb-0">
                    {intl.formatMessage(messages.sessionsCaption, {
                      count: sessions?.sessionsDelivered,
                    })}
                  </p>
                </div>

                <div className="dashboard-sessions__trend">
                  <WeeklySessionsChart
                    weeks={hoursPerWeek}
                    label={intl.formatMessage(messages.sessionsTrendChartLabel, {
                      weeks: hoursPerWeek.length,
                    })}
                  />
                  <p className="dashboard-sessions__trend-caption mb-0">
                    {intl.formatMessage(messages.sessionsTrendCaption, {
                      weeks: hoursPerWeek.length,
                    })}
                    <IconButtonWithTooltip
                      src={InfoOutline}
                      size="inline"
                      alt={intl.formatMessage(messages.sessionsTrendInfoAlt)}
                      tooltipPlacement="top"
                      tooltipContent={intl.formatMessage(messages.sessionsTrendInfo)}
                      className="dashboard-sessions__trend-info"
                    />
                  </p>
                </div>
              </div>

              <div className="row dashboard-sessions__grid">
                <div className="col-12 col-xl-7">
                  <h3 className="dashboard-subheading">
                    {intl.formatMessage(messages.sessionsHoursByProgram)}
                  </h3>
                  {hoursByProgram.length ? (
                    <ul className="dashboard-rows list-unstyled mb-0">
                      {hoursByProgram.map(program => (
                        <li className="dashboard-row" key={program.id}>
                          <span className="dashboard-row__label">{program.name}</span>
                          <MeterBar
                            percentage={(program.hours / maxProgramHours) * 100}
                            color={TONE_COLORS.info}
                            className="dashboard-row__meter"
                          />
                          <span className="dashboard-row__value">
                            {intl.formatMessage(messages.sessionsProgramHours, {
                              hours: program.hours,
                            })}
                            <em className="dashboard-row__value-note">
                              {` ${intl.formatMessage(messages.sessionsProgramSessions, {
                                count: program.sessions,
                              })}`}
                            </em>
                            <span className="sr-only">{` ${intl.formatMessage(messages.sessionsUnit)}`}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="dashboard-state__empty mb-0">
                      {intl.formatMessage(messages.sessionsProgramsEmpty)}
                    </p>
                  )}
                </div>

                <div className="col-12 col-xl-5">
                  <h3 className="dashboard-subheading">
                    {intl.formatMessage(messages.sessionsAtAGlance)}
                  </h3>
                  <div className="row">
                    {AT_A_GLANCE.map((stat) => {
                      const { value, unit } = glanceValues[stat.id];
                      return (
                        <div className="col-6 dashboard-stat-col" key={stat.id}>
                          <div className="dashboard-stat">
                            <p className="dashboard-stat__value mb-0">
                              {value}
                              {unit && <small className="dashboard-stat__unit">{unit}</small>}
                            </p>
                            <p className="dashboard-stat__label mb-0">
                              {intl.formatMessage(messages[stat.labelKey])}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          </SectionState>
        </Card.Section>
      </Card>
    </section>
  );
};

SessionsOverview.propTypes = {
  /** `null` until `GET /fbr/api/reports/dashboard/sessions/` resolves. */
  sessions: PropTypes.shape({
    totalHours: PropTypes.number.isRequired,
    sessionsDelivered: PropTypes.number.isRequired,
    averageSessionHours: PropTypes.number,
    sessionsThisWeek: PropTypes.number.isRequired,
    upcomingSessions: PropTypes.number.isRequired,
    instructorsDelivering: PropTypes.number.isRequired,
    hoursByProgram: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      hours: PropTypes.number.isRequired,
      sessions: PropTypes.number.isRequired,
    })).isRequired,
    hoursPerWeek: PropTypes.arrayOf(PropTypes.shape({
      weekStart: PropTypes.string,
      hours: PropTypes.number.isRequired,
    })).isRequired,
  }),
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
};

SessionsOverview.defaultProps = {
  sessions: null,
  isLoading: false,
  isError: false,
};

export default SessionsOverview;
