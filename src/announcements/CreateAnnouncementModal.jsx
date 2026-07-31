import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from '@openedx/paragon';
import { Editor } from '@tinymce/tinymce-react';
import 'tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/lists';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  createAnnouncement, sendAnnouncement, uploadAttachment, previewRecipients,
} from './api';
import './CreateAnnouncementModal.css';

const extractResults = (data) => {
  if (Array.isArray(data?.results)) { return data.results; }
  if (Array.isArray(data)) { return data; }
  return [];
};

const fetchPrograms = () => getAuthenticatedHttpClient()
  .get(`${getConfig().STUDIO_BASE_URL}/fbr/api/programs/`)
  .then(({ data }) => extractResults(data));

const SCOPE_OPTIONS = [
  { value: 'sitewide', title: 'Sitewide', desc: 'All active users on the platform' },
  { value: 'program', title: 'Program', desc: 'Users in a specific program' },
];

const CHANNEL_OPTIONS = [
  { id: 'email', label: 'Email', desc: 'Delivered to inboxes' },
  { id: 'banner', label: 'Banner', desc: 'Top-of-page banner' },
  { id: 'notification', label: 'Notification', desc: 'In-platform tray' },
];

const RECIPIENT_TYPE_OPTIONS = {
  sitewide: [
    { value: 'admin', label: 'Admins' },
    { value: 'instructor', label: 'Instructors' },
    { value: 'trainee', label: 'Trainees' },
  ],
  program: [
    { value: 'instructor', label: 'Instructors' },
    { value: 'trainee', label: 'Trainees' },
  ],
};

const DEFAULT_RECIPIENT_TYPES = {
  sitewide: ['admin', 'instructor', 'trainee'],
  program: ['instructor', 'trainee'],
};

const TINYMCE_INIT = {
  height: 280,
  menubar: false,
  plugins: 'paste link image lists',
  toolbar: 'bold italic underline | bullist numlist | link image | removeformat',
  branding: false,
  statusbar: false,
};

const CreateAnnouncementModal = ({ onClose, onCreated }) => {
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [summary, setSummary] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendBanner, setSendBanner] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);
  const [scope, setScope] = useState('sitewide');
  const [programKey, setProgramKey] = useState('');
  const [recipientTypes, setRecipientTypes] = useState(DEFAULT_RECIPIENT_TYPES.sitewide);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState([]);
  const [scopeOptionsLoading, setScopeOptionsLoading] = useState(false);
  const [recipientCount, setRecipientCount] = useState(null);
  const [recipientCountLoading, setRecipientCountLoading] = useState(false);
  const fileInputRef = useRef(null);
  const previewTimerRef = useRef(null);

  useEffect(() => {
    setRecipientTypes(DEFAULT_RECIPIENT_TYPES[scope] || []);
    if (scope === 'program' && programs.length === 0) {
      setScopeOptionsLoading(true);
      fetchPrograms()
        .then(setPrograms)
        .catch(() => {})
        .finally(() => setScopeOptionsLoading(false));
    }
  }, [scope]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canPreview = scope === 'sitewide' || (scope === 'program' && programKey);

    if (!canPreview || recipientTypes.length === 0) { setRecipientCount(null); return undefined; }

    clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      setRecipientCountLoading(true);
      previewRecipients(scope, programKey, recipientTypes)
        .then(({ data }) => setRecipientCount(data.count))
        .catch(() => setRecipientCount(null))
        .finally(() => setRecipientCountLoading(false));
    }, 400);

    return () => clearTimeout(previewTimerRef.current);
  }, [scope, programKey, recipientTypes]);

  const needsSummary = sendBanner || sendNotification;

  const isFormReady = (
    subject.trim() !== ''
    && bodyHtml.trim() !== ''
    && (!needsSummary || summary.trim() !== '')
    && (scope !== 'program' || programKey.trim() !== '')
    && recipientTypes.length > 0
  );

  const validate = () => {
    if (!subject.trim()) { return 'Subject is required.'; }
    if (!bodyHtml.trim()) { return 'Body is required.'; }
    if (needsSummary && !summary.trim()) { return 'Summary is required when Banner or Notification is enabled.'; }
    if (scope === 'program' && !programKey.trim()) { return 'Please select a program.'; }
    if (recipientTypes.length === 0) { return 'Please select at least one recipient type.'; }
    return null;
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        subject,
        body_html: bodyHtml,
        summary,
        send_email: sendEmail,
        send_banner: sendBanner,
        send_notification: sendNotification,
        scope,
        program_key: scope === 'program' ? programKey : '',
        recipient_types: recipientTypes,
      };

      const { data: created } = await createAnnouncement(payload);

      await Promise.all(files.map(file => uploadAttachment(created.id, file)));

      await sendAnnouncement(created.id);

      onCreated();
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.non_field_errors;
      setError(Array.isArray(detail) ? detail.join(' ') : (detail || 'Failed to send announcement. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const channelState = { email: sendEmail, banner: sendBanner, notification: sendNotification };
  const channelSetter = { email: setSendEmail, banner: setSendBanner, notification: setSendNotification };

  return (
    <div className="ann-overlay" role="dialog" aria-modal="true">
      <div className="ann-modal">
        <div className="ann-header">
          <h2 className="ann-modal-title">Create Announcement</h2>
          <button type="button" onClick={onClose} className="ann-close-btn">×</button>
        </div>

        <div className="ann-body">
          {error && <div className="ann-error">{error}</div>}

          {/* Subject */}
          <div className="ann-field">
            <label htmlFor="ann-subject" className="ann-label">Subject *</label>
            <Form.Control
              id="ann-subject"
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Announcement subject"
            />
          </div>

          {/* Body */}
          <div className="ann-field">
            <span className="ann-label">Body *</span>
            <Editor
              init={TINYMCE_INIT}
              value={bodyHtml}
              onEditorChange={val => setBodyHtml(val)}
            />
          </div>

          {/* Attachments */}
          <div className="ann-field">
            <span className="ann-label">Attachments</span>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              + Add Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="d-none"
            />
            {files.length > 0 && (
              <ul className="ann-file-list">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`} // eslint-disable-line react/no-array-index-key
                    className="ann-file-item"
                  >
                    <span className="ann-file-name">
                      {file.name}
                      {' '}
                      <span className="ann-file-size">({(file.size / 1024).toFixed(0)} KB)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ann-file-remove"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Channels */}
          <div className="ann-field">
            <span className="ann-label">Delivery Channels</span>
            <div className="ann-channels-grid">
              {CHANNEL_OPTIONS.map(ch => (
                <button
                  key={ch.id}
                  type="button"
                  className={`ann-tile${channelState[ch.id] ? ' ann-tile--selected' : ''}`}
                  onClick={() => channelSetter[ch.id](v => !v)}
                >
                  <div className="ann-tile-title">{ch.label}</div>
                  <div className="ann-tile-desc">{ch.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary (conditional) */}
          {needsSummary && (
            <div className="ann-field">
              <label htmlFor="ann-summary" className="ann-label">
                Summary *
                {' '}
                <span className="ann-label-note">(shown in banner / notification; max 280 chars)</span>
              </label>
              <Form.Control
                id="ann-summary"
                as="textarea"
                rows={2}
                value={summary}
                onChange={e => setSummary(e.target.value.slice(0, 280))}
                placeholder="Short summary visible in the banner and notification..."
              />
              <small className="ann-summary-count">{summary.length}/280</small>
            </div>
          )}

          {/* Audience */}
          <div className="ann-field">
            <span className="ann-label">Audience</span>
            <div className="ann-audience-card">
              <div className="ann-scope-tiles">
                {SCOPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`ann-tile${scope === opt.value ? ' ann-tile--selected' : ''}`}
                    onClick={() => setScope(opt.value)}
                  >
                    <div className="ann-tile-title">{opt.title}</div>
                    <div className="ann-tile-desc">{opt.desc}</div>
                  </button>
                ))}
              </div>

              {scope === 'program' && (
                <div className="ann-program-selector">
                  {scopeOptionsLoading ? (
                    <p className="ann-program-loading">Loading programs...</p>
                  ) : (
                    <Form.Control
                      as="select"
                      value={programKey}
                      onChange={e => setProgramKey(e.target.value)}
                    >
                      <option value="">— Select a program —</option>
                      {programs.map(p => (
                        <option key={p.program_key} value={p.program_key}>{p.name} ({p.program_key})</option>
                      ))}
                    </Form.Control>
                  )}
                </div>
              )}

              <div className="ann-send-to-row">
                <span className="ann-send-to-label">Send to</span>
                <div className="ann-pills">
                  {(RECIPIENT_TYPE_OPTIONS[scope] || []).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`ann-pill${recipientTypes.includes(opt.value) ? ' ann-pill--active' : ''}`}
                      onClick={() => setRecipientTypes(
                        prev => (prev.includes(opt.value)
                          ? prev.filter(t => t !== opt.value)
                          : [...prev, opt.value]),
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ann-recipient-bar">
          {recipientCountLoading && 'Calculating recipients...'}
          {!recipientCountLoading && recipientCount !== null && (
            <span>
              <strong>{recipientCount}</strong> user{recipientCount !== 1 ? 's' : ''} will receive this announcement
            </span>
          )}
          {!recipientCountLoading && recipientCount === null && (
            <span className="ann-recipient-muted">Select a scope above to see recipient count</span>
          )}
        </div>

        <div className="ann-footer">
          <Button variant="tertiary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting || !isFormReady}>
            {submitting ? 'Sending...' : 'Send Announcement'}
          </Button>
        </div>
      </div>
    </div>
  );
};

CreateAnnouncementModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};

export default CreateAnnouncementModal;
