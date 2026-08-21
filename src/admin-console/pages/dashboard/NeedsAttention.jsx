import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Card } from '@openedx/paragon';
import {
  EditOutline, EventBusy, PendingActions, PersonAdd, PersonSearch,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import AttentionRow from './AttentionRow';
import SectionState from './SectionState';
import {
  getProgramRequestsUrl, getSessionAttendanceUrl, getSubstituteRequestsUrl,
} from './data/api';
import { formatDateTime } from '../../utils/date';
import messages from './messages';

/**
 * Each row is a node: `children` makes it expand, `to`/`href` makes it
 * navigate. Nothing carries both, so the whole list follows one rule at every
 * depth.
 */
const buildTasks = (intl, needsAttention) => {
  const { markingWindow, pendingRequests, unassignedSubstitutes } = needsAttention;

  const programEyebrow = intl.formatMessage(messages.attentionProgramEyebrow);

  // `daysLeft` is the soonest deadline in the programme, never one all of its
  // sessions share - hence "first closes in", not "closes in".
  const markingSummary = program => intl.formatMessage(messages.attentionMarkingSummary, {
    sessions: program.sessionCount,
    trainees: program.unmarkedTrainees,
    days: program.daysLeft,
  });

  const markingSession = (program, course, session) => ({
    id: session.id,
    title: session.title || intl.formatMessage(messages.attentionSessionUntitled),
    description: intl.formatMessage(messages.attentionSessionSummary, {
      date: formatDateTime(session.startTime),
      trainees: session.unmarkedTrainees,
      days: session.daysLeft,
    }),
    href: getSessionAttendanceUrl(program.programKey, session.sessionId, course.courseId),
  });

  // The course heads its sessions and links nowhere - the session is what an
  // admin opens, so it is what carries the destination.
  //
  // "Sessions without a course" is dropped when it is the programme's only
  // group: with nothing to tell it apart from, it names no distinction and
  // leaves an admin reading a heading that says less than the row above it. A
  // real course keeps its heading either way, because the name is information.
  const markingCourse = (program, course) => ({
    id: course.id,
    isGroup: true,
    title: course.courseId
      ? course.title || course.courseId
      : intl.formatMessage(messages.attentionCourseUnassigned),
    children: course.sessions.map(session => markingSession(program, course, session)),
  });

  const markingChildren = (program) => {
    const [only] = program.courses;
    if (program.courses.length === 1 && !only.courseId) {
      return only.sessions.map(session => markingSession(program, only, session));
    }
    return program.courses.map(course => markingCourse(program, course));
  };

  return [
    {
      id: 'loginApprovals',
      count: needsAttention.loginApprovals,
      icon: PersonAdd,
      tone: 'caution',
      title: intl.formatMessage(messages.loginApprovalsTitle),
      description: intl.formatMessage(messages.loginApprovalsDescription),
      to: '/signup-approvals',
    },
    {
      id: 'biodataEditRequests',
      count: needsAttention.biodataEditRequests,
      icon: EditOutline,
      tone: 'info',
      title: intl.formatMessage(messages.biodataEditRequestsTitle),
      description: intl.formatMessage(messages.biodataEditRequestsDescription),
      to: '/biodata-edit-requests',
    },
    {
      id: 'markingWindow',
      count: markingWindow.totalSessions,
      icon: EventBusy,
      tone: 'negative',
      title: intl.formatMessage(messages.markingWindowTitle),
      description: intl.formatMessage(messages.markingWindowDescription, {
        trainees: markingWindow.totalUnmarkedTrainees,
        days: markingWindow.thresholdDays,
      }),
      children: markingWindow.programs.map(program => ({
        id: program.id,
        eyebrow: programEyebrow,
        title: program.name,
        description: markingSummary(program),
        children: markingChildren(program),
      })),
    },
    {
      id: 'pendingRequests',
      count: pendingRequests.totalPrograms,
      icon: PendingActions,
      tone: 'caution',
      title: intl.formatMessage(messages.pendingRequestsTitle),
      description: intl.formatMessage(messages.pendingRequestsDescription),
      children: pendingRequests.programs.map(program => ({
        id: program.id,
        eyebrow: programEyebrow,
        title: program.name,
        description: intl.formatMessage(messages.attentionPendingSummary, {
          count: program.pending,
        }),
        href: getProgramRequestsUrl(program.programKey),
      })),
    },
    {
      id: 'unassignedSubstitutes',
      count: unassignedSubstitutes.totalSessions,
      icon: PersonSearch,
      tone: 'negative',
      title: intl.formatMessage(messages.substitutesTitle),
      description: intl.formatMessage(messages.substitutesDescription),
      children: unassignedSubstitutes.programs.map(program => ({
        id: program.id,
        eyebrow: programEyebrow,
        title: program.name,
        description: program.soonestSession
          ? intl.formatMessage(messages.attentionSubstituteSummary, {
            sessions: program.sessions,
            date: formatDateTime(program.soonestSession),
          })
          : intl.formatMessage(messages.attentionSessionCount, { count: program.sessions }),
        href: getSubstituteRequestsUrl(program.programKey),
      })),
    },
  ].filter(task => task.count > 0);
};

/**
 * Outstanding work, one row per kind. A row that has reached zero drops off -
 * the card is a queue, not a scoreboard - and when every row is clear the card
 * says so rather than disappearing, so it still holds its loading and error
 * states.
 */
const NeedsAttention = ({ needsAttention, isLoading, isError }) => {
  const intl = useIntl();
  const sectionName = intl.formatMessage(messages.attentionTitle);
  const tasks = needsAttention ? buildTasks(intl, needsAttention) : [];

  return (
    <section className="dashboard-section" aria-labelledby="dashboard-attention-heading">
      <Card className="dashboard-attention">
        <div className="dashboard-attention__header d-flex align-items-center">
          <h2 className="dashboard-attention__title mb-0" id="dashboard-attention-heading">
            {sectionName}
          </h2>
          {tasks.length > 0 && (
            <Badge className="dashboard-attention__badge">
              {intl.formatMessage(messages.attentionCount, { count: tasks.length })}
            </Badge>
          )}
        </div>

        <SectionState
          section={sectionName}
          isLoading={isLoading}
          isError={isError}
          isEmpty={Boolean(needsAttention) && tasks.length === 0}
          emptyMessage={intl.formatMessage(messages.attentionEmpty)}
        >
          <ul className="dashboard-attention__list list-unstyled mb-0">
            {tasks.map(task => <AttentionRow node={task} key={task.id} />)}
          </ul>
        </SectionState>
      </Card>
    </section>
  );
};

const attentionProgram = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

const attentionMarkingProgram = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  sessionCount: PropTypes.number.isRequired,
  unmarkedTrainees: PropTypes.number.isRequired,
  daysLeft: PropTypes.number.isRequired,
  courses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    courseId: PropTypes.string,
    title: PropTypes.string,
    sessions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      sessionId: PropTypes.string.isRequired,
      title: PropTypes.string,
      startTime: PropTypes.string,
      unmarkedTrainees: PropTypes.number.isRequired,
      daysLeft: PropTypes.number.isRequired,
    })).isRequired,
  })).isRequired,
});

NeedsAttention.propTypes = {
  /** `null` until `GET /fbr/api/reports/dashboard/needs-attention/` resolves. */
  needsAttention: PropTypes.shape({
    loginApprovals: PropTypes.number.isRequired,
    biodataEditRequests: PropTypes.number.isRequired,
    markingWindow: PropTypes.shape({
      thresholdDays: PropTypes.number.isRequired,
      totalSessions: PropTypes.number.isRequired,
      totalUnmarkedTrainees: PropTypes.number.isRequired,
      programs: PropTypes.arrayOf(attentionMarkingProgram).isRequired,
    }).isRequired,
    pendingRequests: PropTypes.shape({
      totalPrograms: PropTypes.number.isRequired,
      programs: PropTypes.arrayOf(attentionProgram).isRequired,
    }).isRequired,
    unassignedSubstitutes: PropTypes.shape({
      totalSessions: PropTypes.number.isRequired,
      programs: PropTypes.arrayOf(attentionProgram).isRequired,
    }).isRequired,
  }),
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
};

NeedsAttention.defaultProps = {
  needsAttention: null,
  isLoading: false,
  isError: false,
};

export default NeedsAttention;
