import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Badge, Icon, IconButton, Sheet, Spinner,
} from '@openedx/paragon';
import { AccessTime, CalendarToday } from '@openedx/paragon/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useInstructorSessionDetails } from './data/apiHooks';
import { REPORT_PAGE_SIZE } from './constants';
import { formatDate } from '../../utils/date';
import messages from './messages';

/**
 * Right-side panel listing the courses - and, within each course, the
 * individual sessions - behind an instructor's session count for one
 * program row. Opened from the clickable session count cell in
 * `ReportDataTable`. `instructor`/`program` (the row's own display labels)
 * render immediately in the header; `instructorId`/`programKey` drive a
 * fetch of the real per-row Detail/Expansion API (Program Key + Instructor
 * ID in, all courses and each course's sessions - Session Title, Duration,
 * Session Start Date - out) for the body. Each course renders as a static
 * heading followed by its sessions as a plain, separator-divided list -
 * the Sheet is too narrow for a table or the extra interaction of
 * expand/collapse. `page`/`pageSize` are threaded through to the query
 * today at `REPORT_PAGE_SIZE`/page 1 so this can grow into real pagination
 * later without changing the data flow.
 */
const SessionDetailsSheet = ({
  show, instructor, program, instructorId, programKey, onClose,
}) => {
  const intl = useIntl();

  const { data, isLoading, isError } = useInstructorSessionDetails(
    {
      instructorId, programKey, page: 1, pageSize: REPORT_PAGE_SIZE,
    },
    { enabled: show },
  );
  const courses = data?.courses || [];

  return (
    <Sheet position="right" show={show} onClose={onClose} className="session-details-sheet">
      <div className="session-details-sheet__header d-flex align-items-start justify-content-between">
        <div className="session-details-sheet__heading">
          <p className="session-details-sheet__eyebrow text-uppercase mb-1">
            {intl.formatMessage(messages.sessionSheetEyebrow)}
          </p>
          <h2 className="session-details-sheet__title h5 font-weight-bold mb-0">{instructor}</h2>
          <p className="session-details-sheet__subtitle text-muted mb-0">{program}</p>
        </div>
        <IconButton
          iconAs={FontAwesomeIcon}
          icon={faTimes}
          alt={intl.formatMessage(messages.closeSessionSheet)}
          size="sm"
          onClick={onClose}
        />
      </div>

      {isLoading && (
        <div className="session-details-sheet__loading d-flex justify-content-center py-4">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.sessionSheetLoading)} />
        </div>
      )}

      {!isLoading && isError && (
        <Alert variant="danger">{intl.formatMessage(messages.sessionSheetLoadError)}</Alert>
      )}

      {!isLoading && !isError && courses.length === 0 && (
        <p className="session-details-sheet__empty text-muted mb-0">
          {intl.formatMessage(messages.sessionsEmptyState)}
        </p>
      )}

      {!isLoading && !isError && courses.map(course => (
        <div key={course.courseKey} className="session-details-sheet__course">
          <div className="session-details-sheet__course-header bg-primary-100 p-2 d-flex align-items-center justify-content-between">
            <span className="session-details-sheet__course-name h6 font-weight-bold mb-0">
              {course.courseName}
            </span>
            <Badge variant="light" pill>
              {intl.formatMessage(messages.sessionSheetCourseSessionCount, { count: course.sessions.length })}
            </Badge>
          </div>

          <div className="session-details-sheet__session-list px-3">
            {course.sessions.map(session => (
              <div key={session.id} className="session-details-sheet__session">
                <p className="session-details-sheet__session-title mb-1">{session.title}</p>
                <div className="session-details-sheet__session-meta d-flex flex-wrap">
                  <span className="session-details-sheet__session-meta-item d-inline-flex align-items-center">
                    <Icon src={AccessTime} className="session-details-sheet__meta-icon" />
                    {session.duration != null
                      ? intl.formatMessage(messages.sessionSheetDurationValue, { hours: session.duration })
                      : intl.formatMessage(messages.sessionSheetNoDuration)}
                  </span>
                  <span className="session-details-sheet__session-meta-item d-inline-flex align-items-center">
                    <Icon src={CalendarToday} className="session-details-sheet__meta-icon" />
                    {formatDate(session.startDate) || intl.formatMessage(messages.sessionSheetNoDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Sheet>
  );
};

SessionDetailsSheet.propTypes = {
  show: PropTypes.bool.isRequired,
  instructor: PropTypes.string.isRequired,
  program: PropTypes.string.isRequired,
  instructorId: PropTypes.string,
  programKey: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

SessionDetailsSheet.defaultProps = {
  instructorId: null,
  programKey: null,
};

export default SessionDetailsSheet;
