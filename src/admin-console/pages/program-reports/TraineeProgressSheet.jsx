import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Icon, IconButton, ProgressBar, Sheet, Spinner,
} from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { UserIdentity } from '@edly-io/frontend-component-fbr';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useTraineeProgress } from './data/apiHooks';
import { exportTraineeProgress } from './data/api';
import { getCourseVariant } from './constants';
import { downloadBlob } from '../../utils/download';
import messages from './messages';

const toPercent = (metric) => Math.round(metric?.percent || 0);

const CourseMetricRow = ({
  label, available, percent, isLast,
}) => {
  const intl = useIntl();
  const rowClassName = `trainee-progress-sheet__metric py-2${isLast ? '' : ' trainee-progress-sheet__metric-divider'}`;

  return (
    <div className={rowClassName}>
      <ProgressBar className="mb-1 border-0 rounded-pill">
        <ProgressBar now={available ? percent : 0} className="bg-success rounded-pill" />
      </ProgressBar>
      <div className="d-flex align-items-center justify-content-between">
        <span>{label}</span>
        {available ? (
          <span className="font-weight-bold">{`${percent}%`}</span>
        ) : (
          <span className="text-muted">{intl.formatMessage(messages.metricNotAvailable)}</span>
        )}
      </div>
    </div>
  );
};

CourseMetricRow.propTypes = {
  label: PropTypes.string.isRequired,
  available: PropTypes.bool.isRequired,
  percent: PropTypes.number,
  isLast: PropTypes.bool,
};

CourseMetricRow.defaultProps = {
  percent: 0,
  isLast: false,
};

/**
 * Right-side panel showing one trainee's edX grade and course-completion
 * progress across every course in a program. Opened from the view action in
 * `ProgramOverviewPanel`. `trainee`/`program` (display labels already known
 * from the row) render immediately in the header; `traineeId`/`programKey`
 * drive the `trainee-progress` fetch for the body. The per-course header
 * card + rounded-pill progress rows mirror `CourseScoresSheet` in
 * frontend-app-authoring's bulk-trainee-results, for a consistent look
 * across the two "trainee's course results" panels in the product.
 */
const TraineeProgressSheet = ({
  show, trainee, email, program, traineeId, programKey, onClose,
}) => {
  const intl = useIntl();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const { data, isLoading, isError } = useTraineeProgress(
    programKey,
    traineeId,
    { enabled: show },
  );
  const courses = useMemo(() => data?.courses || [], [data]);

  // The backend renders the CSV from the same payload this panel is showing -
  // `GET .../trainee-progress/export/` takes the same program/trainee params.
  const handleDownloadCsv = async () => {
    if (isExporting) { return; }
    setIsExporting(true);
    setExportError('');
    try {
      const { blob, filename } = await exportTraineeProgress(programKey, traineeId);
      downloadBlob(blob, filename);
    } catch (exportRequestError) {
      setExportError(exportRequestError?.response?.data?.detail || intl.formatMessage(messages.exportError));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Sheet position="right" show={show} onClose={onClose} className="trainee-progress-sheet">
      <div className="trainee-progress-sheet__header d-flex align-items-start justify-content-between">
        <div className="trainee-progress-sheet__heading">
          <p className="trainee-progress-sheet__eyebrow text-uppercase mb-1">
            {intl.formatMessage(messages.traineeProgressSheetEyebrow)}
          </p>
          <UserIdentity name={trainee} badges={['Trainee']} size="default" showAvatar enableHoverCard={false} />
          {email && <p className="small text-muted mb-0 mt-1">{email}</p>}
          <p className="small text-muted mb-0">{program}</p>
        </div>
        <div className="trainee-progress-sheet__header-actions d-flex align-items-center">
          <IconButton
            src={Download}
            iconAs={Icon}
            alt={intl.formatMessage(messages.downloadTraineeProgressCsv, { trainee })}
            size="sm"
            disabled={isExporting || courses.length === 0}
            onClick={handleDownloadCsv}
          />
          <IconButton
            iconAs={FontAwesomeIcon}
            icon={faTimes}
            alt={intl.formatMessage(messages.closeTraineeProgressSheet)}
            size="sm"
            onClick={onClose}
          />
        </div>
      </div>

      {exportError && <Alert variant="danger" className="mt-3">{exportError}</Alert>}

      {isLoading && (
        <div className="trainee-progress-sheet__loading d-flex justify-content-center py-4">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.traineeProgressLoading)} />
        </div>
      )}

      {!isLoading && isError && (
        <Alert variant="danger">{intl.formatMessage(messages.traineeProgressLoadError)}</Alert>
      )}

      {!isLoading && !isError && courses.length === 0 && (
        <p className="trainee-progress-sheet__empty text-muted mb-0">
          {intl.formatMessage(messages.traineeProgressEmptyState)}
        </p>
      )}

      {!isLoading && !isError && courses.map((course, index) => {
        const gradePercent = toPercent(course.grade);
        const progressPercent = toPercent(course.progress);
        const variant = getCourseVariant(index);

        return (
          <div key={course.courseId} className="trainee-progress-sheet__course mb-3">
            <div className={`d-flex align-items-center p-2 rounded-lg bg-${variant}-100`}>
              <div className="trainee-progress-sheet__course-title h4 font-weight-bold flex-grow-1 mb-0">
                {course.courseTitle}
              </div>
              {course.grade.available && course.grade.passed && (
                <span className="badge rounded-pill bg-success-100 text-success-800 ml-3">
                  {intl.formatMessage(messages.gradePassed)}
                </span>
              )}
            </div>

            <div className="trainee-progress-sheet__metrics px-1">
              <CourseMetricRow
                label={intl.formatMessage(messages.colGrade)}
                available={course.grade.available}
                percent={gradePercent}
              />
              <CourseMetricRow
                label={intl.formatMessage(messages.colCourseProgress)}
                available={course.progress.available}
                percent={progressPercent}
                isLast
              />
            </div>
          </div>
        );
      })}
    </Sheet>
  );
};

TraineeProgressSheet.propTypes = {
  show: PropTypes.bool.isRequired,
  trainee: PropTypes.string.isRequired,
  email: PropTypes.string,
  program: PropTypes.string.isRequired,
  traineeId: PropTypes.string,
  programKey: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

TraineeProgressSheet.defaultProps = {
  email: '',
  traineeId: null,
  programKey: null,
};

export default TraineeProgressSheet;
