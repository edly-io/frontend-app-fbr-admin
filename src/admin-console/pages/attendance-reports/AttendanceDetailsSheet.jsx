import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Badge, IconButton, Sheet, Spinner,
} from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useAttendanceDetails } from './data/apiHooks';
import { SESSION_STATUS_LABEL_MESSAGE_KEYS, getSessionStatusVariant } from './constants';
import { formatDate } from '../../utils/date';
import messages from './messages';

const AttendanceSummaryItem = ({ label, value }) => (
  <div className="attendance-details-sheet__summary-item d-flex justify-content-between align-items-center">
    <span className="attendance-details-sheet__summary-label text-muted small">{label}</span>
    <span className="attendance-details-sheet__summary-value font-weight-bold">{value}</span>
  </div>
);

AttendanceSummaryItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

/**
 * Right-side panel listing the courses - and, within each course, the
 * individual sessions with a Present/Absent badge - behind a learner's
 * attendance count for one program row. Opened from the clickable
 * attendance count cell in `ReportDataTable`. `learner`/`program` (the
 * row's own display labels) render immediately in the header;
 * `learnerId`/`programKey` drive a fetch of the (future) Detail API for
 * the body. Mirrors `SessionDetailsSheet`'s layout, swapping the
 * Duration meta item for a per-session attendance status badge since
 * duration isn't the salient metric for this report.
 */
const AttendanceDetailsSheet = ({
  show, learner, program, learnerId, programKey, onClose,
}) => {
  const intl = useIntl();

  const { data, isLoading, isError } = useAttendanceDetails(
    { learnerId, programKey },
    { enabled: show },
  );
  const courses = data?.courses || [];
  const summary = data?.summary;

  return (
    <Sheet position="right" show={show} onClose={onClose} className="attendance-details-sheet">
      <div className="attendance-details-sheet__header d-flex align-items-start justify-content-between">
        <div className="attendance-details-sheet__heading">
          <p className="attendance-details-sheet__eyebrow text-uppercase mb-1">
            {intl.formatMessage(messages.attendanceSheetEyebrow)}
          </p>
          <h2 className="attendance-details-sheet__title h5 font-weight-bold mb-0">{learner}</h2>
          <p className="attendance-details-sheet__subtitle text-muted mb-0">{program}</p>
        </div>
        <IconButton
          iconAs={FontAwesomeIcon}
          icon={faTimes}
          alt={intl.formatMessage(messages.closeAttendanceSheet)}
          size="sm"
          onClick={onClose}
        />
      </div>

      {isLoading && (
        <div className="attendance-details-sheet__loading d-flex justify-content-center py-4">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.attendanceSheetLoading)} />
        </div>
      )}

      {!isLoading && isError && (
        <Alert variant="danger">{intl.formatMessage(messages.attendanceSheetLoadError)}</Alert>
      )}

      {!isLoading && !isError && summary && (
        <div className="attendance-details-sheet__summary bg-light-200 rounded p-3">
          <h3 className="attendance-details-sheet__summary-title h6 font-weight-bold mb-2">
            {intl.formatMessage(messages.attendanceSummaryTitle)}
          </h3>
          <div className="no-gutters">
            <AttendanceSummaryItem
              label={intl.formatMessage(messages.attendanceSummaryTotalSessions)}
              value={summary.total}
            />
            <AttendanceSummaryItem
              label={intl.formatMessage(messages[SESSION_STATUS_LABEL_MESSAGE_KEYS.present])}
              value={summary.present}
            />
            <AttendanceSummaryItem
              label={intl.formatMessage(messages[SESSION_STATUS_LABEL_MESSAGE_KEYS.absent])}
              value={summary.absent}
            />
            <AttendanceSummaryItem
              label={intl.formatMessage(messages[SESSION_STATUS_LABEL_MESSAGE_KEYS.leave])}
              value={summary.leave}
            />
            <AttendanceSummaryItem
              label={intl.formatMessage(messages[SESSION_STATUS_LABEL_MESSAGE_KEYS.pending])}
              value={summary.pending}
            />
            <AttendanceSummaryItem
              label={intl.formatMessage(messages.attendanceSummaryAttendanceRate)}
              value={`${Math.round(summary.attendanceRate || 0)}%`}
            />
          </div>
        </div>
      )}

      {!isLoading && !isError && courses.length === 0 && (
        <p className="attendance-details-sheet__empty text-muted mb-0">
          {intl.formatMessage(messages.attendanceSessionsEmptyState)}
        </p>
      )}

      {!isLoading && !isError && courses.map(course => (
        <div key={course.courseKey} className="attendance-details-sheet__course">
          <div className="attendance-details-sheet__course-header bg-primary-100 p-2 d-flex align-items-center justify-content-between">
            <span className="attendance-details-sheet__course-name h6 font-weight-bold mb-0">
              {course.courseName}
            </span>
            <Badge variant="light" pill>
              {intl.formatMessage(messages.attendanceSheetCourseSessionCount, { count: course.sessions.length })}
            </Badge>
          </div>

          <div className="attendance-details-sheet__session-list px-3">
            {course.sessions.map((session) => {
              const statusLabelKey = SESSION_STATUS_LABEL_MESSAGE_KEYS[session.status];

              return (
                <div key={session.id} className="attendance-details-sheet__session d-flex align-items-center justify-content-between">
                  <div>
                    <p className="attendance-details-sheet__session-title mb-1">{session.title}</p>
                    <div className="attendance-details-sheet__session-meta d-flex flex-wrap">
                      {session.sessionType && (
                        <span className="attendance-details-sheet__session-meta-item">{session.sessionType}</span>
                      )}
                      <span className="attendance-details-sheet__session-meta-item">
                        {formatDate(session.sessionDate) || intl.formatMessage(messages.attendanceSheetNoDate)}
                      </span>
                    </div>
                  </div>
                  <Badge variant={getSessionStatusVariant(session.status)}>
                    {statusLabelKey ? intl.formatMessage(messages[statusLabelKey]) : session.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </Sheet>
  );
};

AttendanceDetailsSheet.propTypes = {
  show: PropTypes.bool.isRequired,
  learner: PropTypes.string.isRequired,
  program: PropTypes.string.isRequired,
  learnerId: PropTypes.string,
  programKey: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

AttendanceDetailsSheet.defaultProps = {
  learnerId: null,
  programKey: null,
};

export default AttendanceDetailsSheet;
