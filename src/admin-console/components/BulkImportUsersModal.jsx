import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faDownload, faFileCsv, faTimes, faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { downloadBulkImportSample } from '../data/api';
import { useAdminConsoleBootstrap, useBulkImportUsersMutation } from '../data/apiHooks';
import messages from './messages';

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
    <span style={{
      background: isError ? '#FDE8E8' : '#EDFAF1',
      color: isError ? '#9B1C1C' : 'var(--pgn-color-green)',
      padding: '3px 9px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      display: 'inline-flex',
    }}
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
      style={{
        position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={event => { if (event.target === event.currentTarget && !closeDisabled) { onClose(); } }}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget && !closeDisabled) {
          onClose();
        }
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '12px', width: '900px', maxWidth: '96vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
      }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #1E4976 100%)', padding: '22px 28px', borderBottom: '3px solid #C9922A', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '16px', position: 'relative',
        }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '18px', flexShrink: 0,
          }}
          >
            <FontAwesomeIcon icon={faFileCsv} />
          </div>
          <div>
            <p style={{
              margin: 0, fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}
            >{intl.formatMessage(messages.bulkImportEyebrow)}
            </p>
            <h2 style={{
              margin: '2px 0 0', fontSize: '20px', fontWeight: 700, color: '#fff',
            }}
            >{intl.formatMessage(messages.bulkImportTitle)}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{intl.formatMessage(messages.bulkImportSubtitle)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            style={{
              position: 'absolute', top: '18px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', color: '#fff', width: '28px', height: '28px', cursor: closeDisabled ? 'not-allowed' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px' }}>
          {importableRoles.length === 0 ? (
            <div style={{
              background: '#FFF8E5', color: '#7A4D00', border: '1px solid #F0D28A', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '13.5px',
            }}
            >
              {intl.formatMessage(messages.bulkImportNoPermission)}
            </div>
          ) : (
            <>
              <Form.Group>
                <Form.Label>{intl.formatMessage(messages.bulkImportTypeLabel)}</Form.Label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                        style={{
                          flex: '1 1 180px',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: `1.5px solid ${active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-border)'}`,
                          background: active ? 'var(--pgn-color-primary-light)' : '#fff',
                          color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-gray-900)',
                          fontWeight: 600,
                          textAlign: 'center',
                        }}
                      >
                        {intl.formatMessage(option.labelMessage)}
                      </button>
                    );
                  })}
                </div>
                <div className="small text-muted mt-2">{activeRoleOption && intl.formatMessage(activeRoleOption.hintMessage)}</div>
              </Form.Group>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', margin: '18px 0',
              }}
              >
                <Button variant="outline-primary" size="sm" onClick={handleDownloadSample} disabled={isDownloading}>
                  <FontAwesomeIcon icon={faDownload} style={{ marginRight: '6px' }} />
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

          {error && (
            <div style={{
              background: '#FDE8E8', color: '#9B1C1C', border: '1px solid #F8B4B4', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '13.5px',
            }}
            >
              {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: '22px' }}>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px',
              }}
              >
                {resultRows.map(([labelMessage, value]) => (
                  <div
                    key={labelMessage.id}
                    style={{
                      border: '1px solid var(--pgn-color-border)', borderRadius: '8px', padding: '10px 12px', minWidth: '130px',
                    }}
                  >
                    <div style={{
                      fontSize: '11px', color: 'var(--pgn-color-text-light)', textTransform: 'uppercase', fontWeight: 700,
                    }}
                    >{intl.formatMessage(labelMessage)}
                    </div>
                    <div style={{ fontSize: '18px', color: 'var(--pgn-color-gray-900)', fontWeight: 700 }}>{value ?? 0}</div>
                  </div>
                ))}
              </div>

              <div style={{ border: '1px solid var(--pgn-color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ maxHeight: '260px', overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--pgn-color-gray-100)' }}>
                        {[
                          messages.resultColumnRow,
                          messages.resultColumnEmail,
                          messages.resultColumnStatus,
                          messages.resultColumnErrors,
                        ].map(labelMessage => (
                          <th
                            key={labelMessage.id}
                            style={{
                              padding: '9px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--pgn-color-gray-500)', fontWeight: 700,
                            }}
                          >{intl.formatMessage(labelMessage)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(result.rows || []).map(row => (
                        <tr key={`${row.row}-${row.email}`} style={{ borderTop: '1px solid var(--pgn-color-gray-100)' }}>
                          <td style={{ padding: '9px 12px', fontWeight: 600 }}>{row.row}</td>
                          <td style={{ padding: '9px 12px', color: 'var(--pgn-color-primary-base)' }}>{row.email || intl.formatMessage(messages.emptyValue)}</td>
                          <td style={{ padding: '9px 12px' }}><ResultStatus status={row.status} /></td>
                          <td style={{ padding: '9px 12px', color: row.status === 'error' ? '#9B1C1C' : 'var(--pgn-color-text-light)' }}>
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

        <div style={{
          padding: '14px 28px', borderTop: '1px solid var(--pgn-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#fff', flexShrink: 0,
        }}
        >
          <Button variant="tertiary" onClick={onClose} disabled={closeDisabled}>{intl.formatMessage(messages.closeButton)}</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            <FontAwesomeIcon icon={dryRun ? faCheck : faUpload} style={{ fontSize: '12px', marginRight: '7px' }} />
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
