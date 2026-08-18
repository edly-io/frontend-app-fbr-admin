import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Badge, Button, Card, Icon,
} from '@openedx/paragon';
import {
  Award, CalendarMonth, ChevronRight, EditOutline, ErrorOutline, PersonAdd,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { TONE_COLORS, TONE_SURFACES } from './constants';
import messages from './messages';

/**
 * `signup-approvals` and `attendance-reports` are the intended destinations. The
 * results-entry and certificate-award screens do not exist in this MFE yet, so
 * those three point at the programs report and need repointing when they land.
 */
const TASK_ROUTES = {
  loginApprovals: '/signup-approvals',
  noResults: '/program-reports',
  lowAttendance: '/attendance-reports',
  draftResults: '/program-reports',
  certificatesPending: '/program-reports',
};

const buildTasks = ({
  intl, programMetrics, attendanceMetrics, pendingApprovals,
}) => {
  const { programsWithoutResults, programsWithDraftResults, certificatesPending } = programMetrics;

  return [
    {
      id: 'loginApprovals',
      count: pendingApprovals,
      icon: PersonAdd,
      tone: 'caution',
      title: intl.formatMessage(messages.loginApprovalsTitle),
      description: intl.formatMessage(messages.loginApprovalsDescription),
      action: intl.formatMessage(messages.loginApprovalsAction),
    },
    {
      id: 'noResults',
      count: programsWithoutResults.length,
      icon: ErrorOutline,
      tone: 'negative',
      title: intl.formatMessage(messages.noResultsTitle, { count: programsWithoutResults.length }),
      description: programsWithoutResults.map(program => program.name).join(', '),
      action: intl.formatMessage(messages.noResultsAction),
    },
    {
      id: 'lowAttendance',
      count: attendanceMetrics.traineesBelowThreshold,
      icon: CalendarMonth,
      tone: 'negative',
      title: intl.formatMessage(messages.lowAttendanceTitle, {
        threshold: attendanceMetrics.threshold,
      }),
      description: intl.formatMessage(messages.lowAttendanceDescription),
      action: intl.formatMessage(messages.lowAttendanceAction),
    },
    {
      id: 'draftResults',
      count: programsWithDraftResults.length,
      icon: EditOutline,
      tone: 'caution',
      title: intl.formatMessage(messages.draftResultsTitle, {
        count: programsWithDraftResults.length,
      }),
      description: intl.formatMessage(messages.draftResultsDescription),
      action: intl.formatMessage(messages.draftResultsAction),
    },
    {
      id: 'certificatesPending',
      count: certificatesPending,
      icon: Award,
      tone: 'positive',
      title: intl.formatMessage(messages.certificatesPendingTitle),
      description: intl.formatMessage(messages.certificatesPendingDescription),
      action: intl.formatMessage(messages.certificatesPendingAction),
    },
  ].filter(task => task.count > 0);
};

const NeedsAttention = ({ programMetrics, attendanceMetrics, pendingApprovals }) => {
  const intl = useIntl();
  const tasks = buildTasks({
    intl, programMetrics, attendanceMetrics, pendingApprovals,
  });

  if (!tasks.length) {
    return null;
  }

  return (
    <section className="dashboard-section" aria-labelledby="dashboard-attention-heading">
      <Card className="dashboard-attention">
        <div className="dashboard-attention__header d-flex align-items-center">
          <h2 className="dashboard-attention__title mb-0" id="dashboard-attention-heading">
            {intl.formatMessage(messages.attentionTitle)}
          </h2>
          <Badge className="dashboard-attention__badge">
            {intl.formatMessage(messages.attentionCount, { count: tasks.length })}
          </Badge>
          <span className="dashboard-attention__caption ml-auto">
            {intl.formatMessage(messages.attentionSubtitle)}
          </span>
        </div>

        <ul className="dashboard-attention__list list-unstyled mb-0">
          {tasks.map(task => (
            <li className="dashboard-attention__item d-flex align-items-center" key={task.id}>
              <span
                className="dashboard-attention__icon"
                style={{
                  backgroundColor: TONE_SURFACES[task.tone],
                  color: TONE_COLORS[task.tone],
                }}
              >
                <Icon src={task.icon} aria-hidden />
              </span>

              <span
                className="dashboard-attention__count"
                style={{ color: TONE_COLORS[task.tone] }}
              >
                {task.count}
              </span>

              <span className="dashboard-attention__text">
                <span className="dashboard-attention__item-title">{task.title}</span>
                <span className="dashboard-attention__item-description">{task.description}</span>
              </span>

              <Button
                as={Link}
                to={TASK_ROUTES[task.id]}
                variant="primary"
                size="sm"
                iconAfter={ChevronRight}
                className="dashboard-attention__action"
                aria-label={intl.formatMessage(messages.attentionAction, {
                  action: task.action,
                  task: `${task.count} ${task.title}`,
                })}
              >
                {task.action}
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
};

NeedsAttention.propTypes = {
  programMetrics: PropTypes.shape({
    programsWithoutResults: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
    programsWithDraftResults: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
    certificatesPending: PropTypes.number,
  }).isRequired,
  attendanceMetrics: PropTypes.shape({
    traineesBelowThreshold: PropTypes.number,
    threshold: PropTypes.number,
  }).isRequired,
  /** From `GET /fbr/api/reports/dashboard/users/`; the rest is still mock-backed. */
  pendingApprovals: PropTypes.number.isRequired,
};

export default NeedsAttention;
