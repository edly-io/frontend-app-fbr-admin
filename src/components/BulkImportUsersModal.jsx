import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faDownload, faFileCsv, faTimes, faUpload,
} from '@fortawesome/free-solid-svg-icons';

const ROLE_OPTIONS = [
  { id: 'trainee', label: 'Trainees' },
  { id: 'instructor', label: 'Instructors' },
];

const ROLE_HINTS = {
  trainee: 'CSV columns include city, trainee_type, batch, date_of_birth, designation, and BPS grade.',
  instructor: 'CSV columns include city, field_of_expertise, and languages/awards/publications.',
};

const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.join(' ');
  if (data.detail) return Array.isArray(data.detail) ? data.detail.join(' ') : data.detail;
  if (data.non_field_errors) return Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : data.non_field_errors;

  const firstError = Object.values(data)[0];
  if (Array.isArray(firstError)) return firstError.join(' ');
  if (typeof firstError === 'string') return firstError;
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
  const isError = status === 'error';
  const label = status === 'valid' ? 'Valid' : status === 'created' ? 'Created' : 'Error';
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
      {label}
    </span>
  );
};

ResultStatus.propTypes = {
  status: PropTypes.string.isRequired,
};

const formatErrors = errors => {
  if (!errors || Object.keys(errors).length === 0) return '';
  return Object.entries(errors)
    .map(([field, message]) => `${field}: ${Array.isArray(message) ? message.join(' ') : message}`)
    .join(' | ');
};

const BulkImportUsersModal = ({
  onClose,
  onImport,
  onDownloadSample,
  allowedRoles,
}) => {
  const importableRoles = useMemo(
    () => ROLE_OPTIONS.filter(role => allowedRoles.includes(role.id)),
    [allowedRoles],
  );
  const [role, setRole] = useState(importableRoles[0]?.id || 'trainee');
  const [file, setFile] = useState(null);
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const canSubmit = importableRoles.length > 0 && file && !isSubmitting;

  const handleDownloadSample = async () => {
    setIsDownloading(true);
    setError('');
    try {
      const blob = await onDownloadSample(role);
      downloadBlob(blob, `sample_${role}_import.csv`);
    } catch (downloadError) {
      setError(getApiErrorMessage(downloadError, 'Unable to download sample CSV.'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please choose a CSV file.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const nextResult = await onImport({ role, file, dryRun });
      setResult(nextResult);
    } catch (submitError) {
      setResult(null);
      setError(getApiErrorMessage(submitError, 'Unable to import users.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDisabled = isSubmitting || isDownloading;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={event => { if (event.target === event.currentTarget && !closeDisabled) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: '12px', width: '900px', maxWidth: '96vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }}>
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #1E4976 100%)', padding: '22px 28px', borderBottom: '3px solid #C9922A', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '18px', flexShrink: 0 }}>
            <FontAwesomeIcon icon={faFileCsv} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>BULK IMPORT</p>
            <h2 style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: 700, color: '#fff' }}>Import Users</h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>Upload a CSV to validate or create trainees and instructors.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            style={{ position: 'absolute', top: '18px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', color: '#fff', width: '28px', height: '28px', cursor: closeDisabled ? 'not-allowed' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px' }}>
          {importableRoles.length === 0 ? (
            <div style={{ background: '#FFF8E5', color: '#7A4D00', border: '1px solid #F0D28A', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '13.5px' }}>
              You do not have permission to import trainees or instructors.
            </div>
          ) : (
            <>
              <Form.Group>
                <Form.Label>Import Type</Form.Label>
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
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <div className="small text-muted mt-2">{ROLE_HINTS[role]}</div>
              </Form.Group>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
                <Button variant="outline-primary" size="sm" onClick={handleDownloadSample} disabled={isDownloading}>
                  <FontAwesomeIcon icon={faDownload} style={{ marginRight: '6px' }} />
                  {isDownloading ? 'Downloading...' : 'Download Sample CSV'}
                </Button>
                <Form.Checkbox
                  checked={dryRun}
                  onChange={event => {
                    setDryRun(event.target.checked);
                    setResult(null);
                  }}
                >
                  Dry run only
                </Form.Checkbox>
              </div>

              <Form.Group>
                <Form.Label>CSV File</Form.Label>
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
            <div style={{ background: '#FDE8E8', color: '#9B1C1C', border: '1px solid #F8B4B4', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '13.5px' }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: '22px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                {[
                  ['Mode', result.dry_run ? 'Dry run' : 'Import'],
                  ['Total rows', result.total],
                  [result.dry_run ? 'Valid rows' : 'Created', result.dry_run ? result.valid : result.created],
                  ['Failed', result.failed],
                ].map(([label, value]) => (
                  <div key={label} style={{ border: '1px solid var(--pgn-color-border)', borderRadius: '8px', padding: '10px 12px', minWidth: '130px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--pgn-color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
                    <div style={{ fontSize: '18px', color: 'var(--pgn-color-gray-900)', fontWeight: 700 }}>{value ?? 0}</div>
                  </div>
                ))}
              </div>

              <div style={{ border: '1px solid var(--pgn-color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ maxHeight: '260px', overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--pgn-color-gray-100)' }}>
                        {['ROW', 'EMAIL', 'STATUS', 'ERRORS'].map(label => (
                          <th key={label} style={{ padding: '9px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--pgn-color-gray-500)', fontWeight: 700 }}>{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(result.rows || []).map(row => (
                        <tr key={`${row.row}-${row.email}`} style={{ borderTop: '1px solid var(--pgn-color-gray-100)' }}>
                          <td style={{ padding: '9px 12px', fontWeight: 600 }}>{row.row}</td>
                          <td style={{ padding: '9px 12px', color: 'var(--pgn-color-primary-base)' }}>{row.email || '—'}</td>
                          <td style={{ padding: '9px 12px' }}><ResultStatus status={row.status} /></td>
                          <td style={{ padding: '9px 12px', color: row.status === 'error' ? '#9B1C1C' : 'var(--pgn-color-text-light)' }}>
                            {formatErrors(row.errors) || '—'}
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

        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--pgn-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#fff', flexShrink: 0 }}>
          <Button variant="tertiary" onClick={onClose} disabled={closeDisabled}>Close</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            <FontAwesomeIcon icon={dryRun ? faCheck : faUpload} style={{ fontSize: '12px', marginRight: '7px' }} />
            {isSubmitting ? 'Processing...' : dryRun ? 'Run Validation' : 'Import Users'}
          </Button>
        </div>
      </div>
    </div>
  );
};

BulkImportUsersModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onDownloadSample: PropTypes.func.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

BulkImportUsersModal.defaultProps = {
  allowedRoles: ['trainee', 'instructor'],
};

export default BulkImportUsersModal;
