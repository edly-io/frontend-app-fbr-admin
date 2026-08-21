import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, Col, Icon, Row,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import SectionHeading from './SectionHeading';
import SectionState from './SectionState';
import {
  KPI_TILES, TONE_COLORS, TONE_SURFACES,
} from './constants';
import messages from './messages';

/** Shown instead of a number the backend reports as `null` - nothing to measure. */
const NO_VALUE = '—';

const TILE_MESSAGES = {
  activePrograms: {
    label: messages.activeProgramsLabel,
    caption: messages.captionActivePrograms,
  },
  enrolledTrainees: {
    label: messages.enrolledTraineesLabel,
    caption: messages.captionEnrolledTrainees,
  },
  overallCompletion: {
    label: messages.overallCompletionLabel,
    caption: messages.captionOverallCompletion,
    emptyCaption: messages.captionOverallCompletionEmpty,
  },
  averageScore: {
    label: messages.averageScoreLabel,
    caption: messages.captionAverageScore,
    emptyCaption: messages.captionAverageScoreEmpty,
  },
  certificatesIssued: {
    label: messages.certificatesIssuedLabel,
    caption: messages.captionCertificatesIssued,
  },
};

const asPercentage = value => (
  value === null ? null : { value: Math.round(value), unit: '%' }
);

/**
 * Returning `null` means the backend had nothing to measure: the tile then shows
 * a dash and the metric's `emptyCaption` rather than inventing a value.
 */
const TILE_VALUES = {
  activePrograms: kpis => ({ value: kpis.activePrograms }),
  enrolledTrainees: kpis => ({ value: kpis.enrolledTrainees }),
  overallCompletion: kpis => asPercentage(kpis.overallCompletion),
  averageScore: kpis => asPercentage(kpis.averageScore),
  certificatesIssued: kpis => ({ value: kpis.certificatesIssued }),
};

const ProgramPerformance = ({ kpis, isLoading, isError }) => {
  const intl = useIntl();
  const sectionName = intl.formatMessage(messages.performanceTitle);

  return (
    <section className="dashboard-section" aria-labelledby="dashboard-performance-heading">
      <SectionHeading
        id="dashboard-performance-heading"
        title={sectionName}
        subtitle={intl.formatMessage(messages.performanceSubtitle)}
      />

      <SectionState
        section={sectionName}
        isLoading={isLoading}
        isError={isError}
        isEmpty={Boolean(kpis) && kpis.activePrograms === 0}
        emptyMessage={intl.formatMessage(messages.performanceEmpty)}
      >
        <Row>
          {kpis && KPI_TILES.map((tile) => {
            const figure = TILE_VALUES[tile.id](kpis);
            const { label, caption, emptyCaption } = TILE_MESSAGES[tile.id];

            return (
              <Col
                xs={12}
                sm={6}
                lg={4}
                xl
                className="dashboard-kpi-col"
                key={tile.id}
              >
                <Card
                  className="dashboard-kpi h-100"
                  style={{ borderLeftColor: TONE_COLORS[tile.tone] }}
                >
                  <Card.Section className="dashboard-kpi__body">
                    <div className="dashboard-kpi__head d-flex align-items-center">
                      <span
                        className="dashboard-kpi__icon"
                        style={{
                          backgroundColor: TONE_SURFACES[tile.tone],
                          color: TONE_COLORS[tile.tone],
                        }}
                      >
                        <Icon src={tile.icon} aria-hidden />
                      </span>
                      <p className="dashboard-kpi__label mb-0">{intl.formatMessage(label)}</p>
                    </div>

                    <p className="dashboard-kpi__value mb-0">
                      {/* Decorative: the caption below says why there is no number. */}
                      {figure ? figure.value : <span aria-hidden="true">{NO_VALUE}</span>}
                      {figure?.unit && <small className="dashboard-kpi__unit">{figure.unit}</small>}
                    </p>

                    <p className="dashboard-kpi__caption mb-0">
                      {intl.formatMessage(figure ? caption : (emptyCaption || caption))}
                    </p>
                  </Card.Section>
                </Card>
              </Col>
            );
          })}
        </Row>
      </SectionState>
    </section>
  );
};

ProgramPerformance.propTypes = {
  /** `null` until `GET /fbr/api/reports/dashboard/kpis/` resolves. */
  kpis: PropTypes.shape({
    activePrograms: PropTypes.number.isRequired,
    enrolledTrainees: PropTypes.number.isRequired,
    overallCompletion: PropTypes.number,
    averageScore: PropTypes.number,
    certificatesIssued: PropTypes.number.isRequired,
  }),
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
};

ProgramPerformance.defaultProps = {
  kpis: null,
  isLoading: false,
  isError: false,
};

export default ProgramPerformance;
