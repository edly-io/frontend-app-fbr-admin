import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import isBulkImportJobActive from '../../data/bulkImportJob';
import messages from '../messages';
import './user-modals-styles.scss';

const JOB_FAILED = 'failed';

export const formatErrors = errors => {
  if (!errors || Object.keys(errors).length === 0) { return ''; }
  return Object.entries(errors)
    .map(([field, message]) => `${field}: ${Array.isArray(message) ? message.join(' ') : message}`)
    .join(' | ');
};

const FailedRowsTable = ({ failures }) => {
  const intl = useIntl();
  return (
    <div className="bulk-import-modal__table-wrap">
      <div className="bulk-import-modal__table-scroll">
        <table className="bulk-import-modal__table">
          <thead>
            <tr className="bulk-import-modal__table-header-row">
              {[messages.resultColumnRow, messages.resultColumnEmail, messages.resultColumnErrors].map(labelMessage => (
                <th key={labelMessage.id} className="bulk-import-modal__table-header-cell">
                  {intl.formatMessage(labelMessage)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {failures.map(failure => (
              <tr key={failure.row} className="bulk-import-modal__table-row">
                <td className="bulk-import-modal__table-cell bulk-import-modal__table-cell--strong">{failure.row}</td>
                <td className="bulk-import-modal__table-cell bulk-import-modal__table-cell--email">{failure.email}</td>
                <td className="bulk-import-modal__table-cell bulk-import-modal__table-cell--error-text">
                  {formatErrors(failure.errors)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

FailedRowsTable.propTypes = {
  failures: PropTypes.arrayOf(PropTypes.shape({
    row: PropTypes.number,
    email: PropTypes.string,
    errors: PropTypes.shape({}),
  })).isRequired,
};

/**
 * What a bulk import job did: still running, or how many users were created
 * plus the rows that failed. Created rows are not listed; they are in the
 * users list.
 */
const ImportJobOutcome = ({ job }) => {
  const intl = useIntl();
  if (!job || isBulkImportJobActive(job)) {
    return <Alert variant="info" className="mb-3">{intl.formatMessage(messages.importInProgress)}</Alert>;
  }
  if (job.status === JOB_FAILED) {
    return <Alert variant="danger" className="mb-3">{intl.formatMessage(messages.importJobFailed)}</Alert>;
  }

  const failed = job.total_rows - job.created_count;
  const summary = failed === 0
    ? intl.formatMessage(messages.importAllCreated, { total: job.total_rows })
    : intl.formatMessage(messages.importPartlyCreated, {
      created: job.created_count, total: job.total_rows, failed,
    });
  return (
    <div className="bulk-import-modal__result">
      <Alert variant={failed === 0 ? 'success' : 'warning'} className="mb-3">{summary}</Alert>
      {job.failures.length > 0 && <FailedRowsTable failures={job.failures} />}
    </div>
  );
};

ImportJobOutcome.propTypes = {
  job: PropTypes.shape({
    status: PropTypes.string.isRequired,
    total_rows: PropTypes.number.isRequired,
    created_count: PropTypes.number.isRequired,
    failures: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  }),
};

ImportJobOutcome.defaultProps = {
  job: null,
};

export default ImportJobOutcome;
