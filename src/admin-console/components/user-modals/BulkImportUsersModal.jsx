import React, { Fragment, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Alert, Button, Form, Icon, ModalDialog,
} from '@openedx/paragon';
import { Info, Warning } from '@openedx/paragon/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faChevronDown, faChevronUp, faDownload, faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { downloadBulkImportSample } from '../../data/api';
import { useAdminConsoleBootstrap, useBulkImportFormat, useBulkImportUsersMutation } from '../../data/apiHooks';
import { downloadBlob } from '../../utils/download';
import messages from '../messages';
import './user-modals-styles.scss';

const ROLE_OPTIONS = [
  { id: 'trainee', labelMessage: messages.bulkImportRoleTrainees },
  { id: 'instructor', labelMessage: messages.bulkImportRoleInstructors },
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

const CITY_COLUMN = 'city';

const ColumnList = ({
  label, columns, ignoredColumn, ignoredLabel, className, testId,
}) => {
  if (columns.length === 0) { return null; }
  return (
    <div className={`small mb-1 ${className}`} data-testid={testId}>
      <span className="font-weight-bold text-dark mr-2">{label}</span>
      {columns.map(({ name }, index) => (
        <Fragment key={name}>
          {index > 0 && ' · '}
          <span className="text-monospace">{name}</span>
          {name === ignoredColumn && <span className="ml-1">{ignoredLabel}</span>}
        </Fragment>
      ))}
    </div>
  );
};

ColumnList.propTypes = {
  label: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired })).isRequired,
  ignoredColumn: PropTypes.string,
  ignoredLabel: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string.isRequired,
};

ColumnList.defaultProps = {
  ignoredColumn: null,
  ignoredLabel: '',
  className: '',
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
  // Optional help: without it the dialog still imports, and the server's 400s explain any rejection.
  const { data: importFormat } = useBulkImportFormat();
  const callerRoles = bootstrapData?.callerProfile?.roles || [];
  const isSuperAdmin = callerRoles.includes('super_admin');
  // Mirrors AddUserModal: every admin below Super Admin imports into their own city.
  // No roles means the profile hasn't loaded (bootstrap falls back to an empty one): no city guidance then.
  const isCityLocked = callerRoles.length > 0 && !isSuperAdmin;
  const lockedCityName = isCityLocked ? bootstrapData.callerProfile.city?.name : null;
  // The server rejects imports from a city-locked admin with no city; say so before upload.
  const hasNoCity = isCityLocked && !lockedCityName;
  let cityHint = null;
  if (lockedCityName) {
    cityHint = intl.formatMessage(messages.bulkImportCityNotice, { city: lockedCityName });
  } else if (isSuperAdmin) {
    cityHint = intl.formatMessage(messages.bulkImportSuperAdminCityHint);
  }

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
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showColumns, setShowColumns] = useState(false);

  const isSubmitting = importMutation.isPending;
  const roleColumns = importFormat?.columns?.[role] || [];
  const requiredColumns = roleColumns.filter(column => column.required);
  const optionalColumns = roleColumns.filter(column => !column.required);
  const canSubmit = importableRoles.length > 0 && file && !isSubmitting && !hasNoCity;
  // Which action is running, so only that button says "Processing...".
  const pendingDryRun = isSubmitting ? importMutation.variables?.dryRun : undefined;
  const processingLabel = intl.formatMessage(messages.processingButton);

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

  const handleSubmit = async (dryRun) => {
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
    <ModalDialog
      isOpen
      onClose={onClose}
      title={intl.formatMessage(messages.bulkImportTitle)}
      size="lg"
      hasCloseButton={!closeDisabled}
      isFullscreenOnMobile
      className="bulk-import-modal"
    >
      <ModalDialog.Header>
        <p className="bulk-import-modal__eyebrow">{intl.formatMessage(messages.bulkImportEyebrow)}</p>
        <ModalDialog.Title>{intl.formatMessage(messages.bulkImportTitle)}</ModalDialog.Title>
        <p className="bulk-import-modal__subtitle">{intl.formatMessage(messages.bulkImportSubtitle)}</p>
      </ModalDialog.Header>

      <ModalDialog.Body>
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
            </Form.Group>

            {hasNoCity && (
              <Alert variant="warning" icon={Warning} className="mb-3">
                {intl.formatMessage(messages.bulkImportNoCityWarning)}
              </Alert>
            )}

            <Form.Group>
              <div className="d-flex flex-wrap align-items-center">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mr-3"
                  onClick={handleDownloadSample}
                  disabled={isDownloading}
                >
                  <FontAwesomeIcon icon={faDownload} className="bulk-import-modal__download-icon" />
                  {isDownloading
                    ? intl.formatMessage(messages.downloadingButton)
                    : intl.formatMessage(messages.downloadSampleButton)}
                </Button>
                {roleColumns.length > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0"
                    aria-expanded={showColumns}
                    onClick={() => setShowColumns(!showColumns)}
                  >
                    {intl.formatMessage(messages.bulkImportShowColumns, {
                      required: requiredColumns.length,
                      optional: optionalColumns.length,
                    })}
                    <FontAwesomeIcon icon={showColumns ? faChevronUp : faChevronDown} className="ml-1" />
                  </Button>
                )}
              </div>
              {showColumns && roleColumns.length > 0 && (
                <div className="mt-2">
                  <ColumnList
                    label={intl.formatMessage(messages.bulkImportRequiredColumns)}
                    columns={requiredColumns}
                    testId="bulk-import-required-columns"
                  />
                  <ColumnList
                    label={intl.formatMessage(messages.bulkImportOptionalColumns)}
                    columns={optionalColumns}
                    ignoredColumn={lockedCityName ? CITY_COLUMN : null}
                    ignoredLabel={intl.formatMessage(messages.bulkImportIgnoredColumn)}
                    className="text-muted"
                    testId="bulk-import-optional-columns"
                  />
                </div>
              )}
            </Form.Group>

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
              {importFormat && (
                <Form.Text muted>
                  {intl.formatMessage(messages.bulkImportFileLimits, {
                    extension: importFormat.extension,
                    size: importFormat.max_file_size_kb,
                    rows: importFormat.max_rows,
                  })}
                </Form.Text>
              )}
              {cityHint && (
                <div className="d-flex align-items-center small mt-2">
                  <Icon src={Info} size="sm" className="text-info mr-2" />
                  {cityHint}
                </div>
              )}
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
                      messages.resultColumnCity,
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
                      <td className="bulk-import-modal__table-cell">
                        {row.city || intl.formatMessage(messages.emptyValue)}
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

      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="tertiary" onClick={onClose} disabled={closeDisabled}>{intl.formatMessage(messages.closeButton)}</Button>
          <Button variant="outline-primary" onClick={() => handleSubmit(true)} disabled={!canSubmit}>
            <FontAwesomeIcon icon={faCheck} className="bulk-import-modal__submit-icon" />
            {pendingDryRun === true ? processingLabel : intl.formatMessage(messages.runValidationButton)}
          </Button>
          <Button variant="primary" onClick={() => handleSubmit(false)} disabled={!canSubmit}>
            <FontAwesomeIcon icon={faUpload} className="bulk-import-modal__submit-icon" />
            {pendingDryRun === false ? processingLabel : intl.formatMessage(messages.importUsersButton)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

BulkImportUsersModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default BulkImportUsersModal;
