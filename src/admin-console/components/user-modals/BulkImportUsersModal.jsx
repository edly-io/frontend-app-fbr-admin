import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Form } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faDownload, faFileCsv, faTimes, faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { downloadBulkImportSample } from '../../data/api';
import { useAdminConsoleBootstrap, useBulkImportUsersMutation } from '../../data/apiHooks';
import messages from '../messages';
import './user-modals-styles.scss';

const ROLE_OPTIONS = [
  { id: 'trainee', labelMessage: messages.bulkImportRoleTrainees, hintMessage: messages.bulkImportHintTrainee },
  { id: 'instructor', labelMessage: messages.bulkImportRoleInstructors, hintMessage: messages.bulkImportHintInstructor },
];

const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) { return fallback; }
  if (typeof data === 'string') { return data; }
  if (Array.isArray(data)) { return data.join(' '); }
  if (data.detail) { return Array.isArray(data.detail) ? data.detail.join(' ') : data.detail; }
  if (data.non_field_errors) { return Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : data.non_field_errors; }

  const firstError = Object.values(data)[0];
  if (Array.isArray(firstError)) { return firstError.join(' '); }
  if (typeof firstError === 'string') { return firstError; }
  return fallback;
};

const downloadBlob = (blob, fallbackName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const ResultStatus = ({ status }) => {
  const intl = useIntl();
  const isError = status === 'error';
  let labelMessage = messages.resultStatusError;
  if (status === 'valid') {
    labelMessage = messages.resultStatusValid;
  } else if (status === 'created') {
    labelMessage = messages.resultStatusCreated;
  }
  return (
    <span
      className={`bulk-import-modal__result-status ${isError ? 'bulk-import-modal__result-status--error' : 'bulk-import-modal__result-status--success'}`}
    >
      {intl.formatMessage(labelMessage)}
    </span>
  );
};

ResultStatus.propTypes = {
  status: PropTypes.string.isRequired,
};

const formatErrors = errors => {
  if (!errors || Object.keys(errors).length === 0) { return ''; }
  return Object.entries(errors)
    .map(([field, message]) => `${field}: ${Array.isArray(message) ? message.join(' ') : message}`)
    .join(' | ');
};

/**
 * Bulk Import Users modal, self-contained: loads `allowedRoles` (creatable
 * roles) via `useAdminConsoleBootstrap`, imports via
 * `useBulkImportUsersMutation`, and downloads the sample CSV directly via
 * `downloadBulkImportSample`, rather than receiving these as props.
 */
const BulkImportUsersModal = ({ onClose }) => {
  const intl = useIntl();
  const { data: bootstrapData } = useAdminConsoleBootstrap();
  const importMutation = useBulkImportUsersMutation();

  const allowedRoles = useMemo(
    () => bootstrapData?.callerProfile?.creatable_roles || ['instructor', 'trainee'],
    [bootstrapData],
  );
  const importableRoles = useMemo(
    () => ROLE_OPTIONS.filter(role => allowedRoles.includes(role.id)),
    [allowedRoles],
  );
  const [role, setRole] = useState(importableRoles[0]?.id || 'trainee');
  const [file, setFile] = useState(null);
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const isSubmitting = importMutation.isPending;
  const activeRoleOption = ROLE_OPTIONS.find(option => option.id === role);
  const canSubmit = importableRoles.length > 0 && file && !isSubmitting;
  let submitLabel = intl.formatMessage(messages.importUsersButton);
  if (isSubmitting) {
    submitLabel = intl.formatMessage(messages.processingButton);
  } else if (dryRun) {
    submitLabel = intl.formatMessage(messages.runValidationButton);
  }

  const handleDownloadSample = async () => {
    setIsDownloading(true);
    setError('');
    try {
      const blob = await downloadBulkImportSample(role);
      downloadBlob(blob, `sample_${role}_import.csv`);
    } catch (downloadError) {
      setError(getApiErrorMessage(downloadError, intl.formatMessage(messages.unableToDownloadSampleError)));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError(intl.formatMessage(messages.chooseFileError));
      return;
    }

    setError('');
    try {
      const nextResult = await importMutation.mutateAsync({ role, file, dryRun });
      setResult(nextResult);
    } catch (submitError) {
      setResult(null);
      setError(getApiErrorMessage(submitError, intl.formatMessage(messages.unableToImportUsersError)));
    }
  };

  const closeDisabled = isSubmitting || isDownloading;
  const resultRows = [
    [
      messages.resultModeLabel,
      result?.dry_run
        ? intl.formatMessage(messages.resultModeDryRun)
        : intl.formatMessage(messages.resultModeImport),
    ],
    [messages.resultTotalRows, result?.total],
    [
      result?.dry_run ? messages.resultValidRows : messages.resultCreated,
      result?.dry_run ? result?.valid : result?.created,
    ],
    [messages.resultFailed, result?.failed],
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      className="bulk-import-modal__overlay"
      onClick={event => { if (event.target === event.currentTarget && !closeDisabled) { onClose(); } }}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget && !closeDisabled) {
          onClose();
        }
      }}
    >
      <div className="bulk-import-modal__panel">
        <div className="bulk-import-modal__header">
          <div className="bulk-import-modal__header-icon">
            <FontAwesomeIcon icon={faFileCsv} />
          </div>
          <div>
            <p className="bulk-import-modal__eyebrow">{intl.formatMessage(messages.bulkImportEyebrow)}</p>
            <h2 className="bulk-import-modal__title">{intl.formatMessage(messages.bulkImportTitle)}</h2>
            <p className="bulk-import-modal__subtitle">{intl.formatMessage(messages.bulkImportSubtitle)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            className="bulk-import-modal__close-btn"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="bulk-import-modal__content">
          {importableRoles.length === 0 ? (
            <Alert variant="warning" className="mb-3">
              {intl.formatMessage(messages.bulkImportNoPermission)}
            </Alert>
          ) : (
            <>
              <Form.Group>
                <Form.Label>{intl.formatMessage(messages.bulkImportTypeLabel)}</Form.Label>
                <div className="bulk-import-modal__role-grid">
                  {importableRoles.map(option => {
                    const active = option.id === role;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setRole(option.id);
                          setResult(null);
                          setError('');
                        }}
                        className={`bulk-import-modal__role-btn ${active ? 'bulk-import-modal__role-btn--active' : ''}`}
                      >
                        {intl.formatMessage(option.labelMessage)}
                      </button>
                    );
                  })}
                </div>
                <div className="small text-muted mt-2">{activeRoleOption && intl.formatMessage(activeRoleOption.hintMessage)}</div>
              </Form.Group>

              <div className="bulk-import-modal__actions-row">
                <Button variant="outline-primary" size="sm" onClick={handleDownloadSample} disabled={isDownloading}>
                  <FontAwesomeIcon icon={faDownload} className="bulk-import-modal__download-icon" />
                  {isDownloading
                    ? intl.formatMessage(messages.downloadingButton)
                    : intl.formatMessage(messages.downloadSampleButton)}
                </Button>
                <Form.Checkbox
                  checked={dryRun}
                  onChange={event => {
                    setDryRun(event.target.checked);
                    setResult(null);
                  }}
                >
                  {intl.formatMessage(messages.dryRunCheckboxLabel)}
                </Form.Checkbox>
              </div>

              <Form.Group>
                <Form.Label>{intl.formatMessage(messages.csvFileLabel)}</Form.Label>
                <Form.Control
                  type="file"
                  accept=".csv,text/csv"
                  onChange={event => {
                    setFile(event.target.files?.[0] || null);
                    setResult(null);
                    setError('');
                  }}
                />
              </Form.Group>
            </>
          )}

          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          {result && (
            <div className="bulk-import-modal__result">
              <div className="bulk-import-modal__result-stats">
                {resultRows.map(([labelMessage, value]) => (
                  <div key={labelMessage.id} className="bulk-import-modal__stat-card">
                    <div className="bulk-import-modal__stat-label">{intl.formatMessage(labelMessage)}</div>
                    <div className="bulk-import-modal__stat-value">{value ?? 0}</div>
                  </div>
                ))}
              </div>

              <div className="bulk-import-modal__table-wrap">
                <div className="bulk-import-modal__table-scroll">
                  <table className="bulk-import-modal__table">
                    <thead>
                      <tr className="bulk-import-modal__table-header-row">
                        {[
                          messages.resultColumnRow,
                          messages.resultColumnEmail,
                          messages.resultColumnStatus,
                          messages.resultColumnErrors,
                        ].map(labelMessage => (
                          <th key={labelMessage.id} className="bulk-import-modal__table-header-cell">
                            {intl.formatMessage(labelMessage)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(result.rows || []).map(row => (
                        <tr key={`${row.row}-${row.email}`} className="bulk-import-modal__table-row">
                          <td className="bulk-import-modal__table-cell bulk-import-modal__table-cell--strong">{row.row}</td>
                          <td className="bulk-import-modal__table-cell bulk-import-modal__table-cell--email">
                            {row.email || intl.formatMessage(messages.emptyValue)}
                          </td>
                          <td className="bulk-import-modal__table-cell"><ResultStatus status={row.status} /></td>
                          <td
                            className={`bulk-import-modal__table-cell ${row.status === 'error' ? 'bulk-import-modal__table-cell--error-text' : 'bulk-import-modal__table-cell--muted'}`}
                          >
                            {formatErrors(row.errors) || intl.formatMessage(messages.emptyValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bulk-import-modal__footer">
          <Button variant="tertiary" onClick={onClose} disabled={closeDisabled}>{intl.formatMessage(messages.closeButton)}</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            <FontAwesomeIcon icon={dryRun ? faCheck : faUpload} className="bulk-import-modal__submit-icon" />
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

BulkImportUsersModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default BulkImportUsersModal;
