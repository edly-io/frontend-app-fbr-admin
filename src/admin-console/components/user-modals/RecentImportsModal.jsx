import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Badge, Button, ModalDialog, Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useBulkImportJob, useBulkImportJobs } from '../../data/apiHooks';
import isBulkImportJobActive from '../../data/bulkImportJob';
import messages from '../messages';
import ImportJobOutcome from './ImportJobOutcome';
import './user-modals-styles.scss';

const ROLE_LABELS = {
  trainee: messages.bulkImportRoleTrainees,
  instructor: messages.bulkImportRoleInstructors,
};

/**
 * What the admin cares about is what happened to the users, not whether the
 * job ran: a job that ran to the end can still have created nobody.
 */
const outcome = (job) => {
  if (isBulkImportJobActive(job)) { return [messages.recentImportsStatusInProgress, 'info']; }
  if (job.status === 'failed') { return [messages.recentImportsStatusDidNotFinish, 'danger']; }
  if (job.created_count === job.total_rows) { return [messages.recentImportsStatusAllCreated, 'success']; }
  if (job.created_count === 0) { return [messages.recentImportsStatusNoneCreated, 'danger']; }
  return [messages.recentImportsStatusPartlyCreated, 'warning'];
};

const OutcomeBadge = ({ job }) => {
  const intl = useIntl();
  const [labelMessage, variant] = outcome(job);
  return <Badge variant={variant}>{intl.formatMessage(labelMessage)}</Badge>;
};

OutcomeBadge.propTypes = {
  job: PropTypes.shape({
    status: PropTypes.string.isRequired,
    total_rows: PropTypes.number.isRequired,
    created_count: PropTypes.number.isRequired,
  }).isRequired,
};

const COLUMNS = [
  messages.recentImportsColumnDate,
  messages.recentImportsColumnType,
  messages.recentImportsColumnStatus,
  messages.recentImportsColumnCreated,
  messages.recentImportsColumnDetails,
];

const JobsTable = ({ jobs, onView }) => {
  const intl = useIntl();
  return (
    <div className="bulk-import-modal__table-wrap">
      <div className="bulk-import-modal__table-scroll">
        <table className="bulk-import-modal__table">
          <thead>
            <tr className="bulk-import-modal__table-header-row">
              {COLUMNS.map(labelMessage => (
                <th key={labelMessage.id} className="bulk-import-modal__table-header-cell">
                  {intl.formatMessage(labelMessage)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="bulk-import-modal__table-row">
                <td className="bulk-import-modal__table-cell">
                  {intl.formatDate(job.created_at, { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="bulk-import-modal__table-cell">{intl.formatMessage(ROLE_LABELS[job.role])}</td>
                <td className="bulk-import-modal__table-cell"><OutcomeBadge job={job} /></td>
                <td className="bulk-import-modal__table-cell">
                  {intl.formatMessage(messages.recentImportsCreatedOfTotal, {
                    created: job.created_count, total: job.total_rows,
                  })}
                </td>
                <td className="bulk-import-modal__table-cell">
                  <Button variant="link" size="sm" className="p-0" onClick={() => onView(job.id)}>
                    {intl.formatMessage(messages.recentImportsViewButton)}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

JobsTable.propTypes = {
  jobs: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number.isRequired })).isRequired,
  onView: PropTypes.func.isRequired,
};

/**
 * The caller's last 10 bulk imports, so an admin who closed the Import Users
 * dialog can still see how an import went. Opening one loads its failed rows.
 */
const RecentImportsModal = ({ onClose }) => {
  const intl = useIntl();
  const { data: jobs = [], isLoading } = useBulkImportJobs();
  const [viewedJobId, setViewedJobId] = useState(null);
  const { data: viewedJob } = useBulkImportJob(viewedJobId);
  const spinner = <Spinner animation="border" screenReaderText={intl.formatMessage(messages.recentImportsLoading)} />;

  let body;
  if (isLoading) {
    body = spinner;
  } else if (viewedJobId) {
    body = (
      <>
        <Button variant="link" size="sm" className="px-0" onClick={() => setViewedJobId(null)}>
          {intl.formatMessage(messages.recentImportsBackButton)}
        </Button>
        {viewedJob ? <ImportJobOutcome job={viewedJob} /> : spinner}
      </>
    );
  } else if (jobs.length === 0) {
    body = <p className="text-muted mb-0">{intl.formatMessage(messages.recentImportsEmpty)}</p>;
  } else {
    body = <JobsTable jobs={jobs} onView={setViewedJobId} />;
  }

  return (
    <ModalDialog
      isOpen
      onClose={onClose}
      title={intl.formatMessage(messages.recentImportsTitle)}
      size="lg"
      isFullscreenOnMobile
      className="bulk-import-modal"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>{intl.formatMessage(messages.recentImportsTitle)}</ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>{body}</ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="tertiary" onClick={onClose}>{intl.formatMessage(messages.closeButton)}</Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

RecentImportsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default RecentImportsModal;
