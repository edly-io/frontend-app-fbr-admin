import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, Form, ModalDialog,
} from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFile, faTimes } from '@fortawesome/free-solid-svg-icons';
import { uploadDocument, updateDocument } from './api';
import DocumentTypeSelect from './DocumentTypeSelect';
import './DocumentModal.css';

const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'txt', 'csv', 'rtf', 'zip',
];
const ACCEPT = ALLOWED_EXTENSIONS.map(e => `.${e}`).join(',');

const formatBytes = (bytes) => {
  if (!bytes) { return ''; }
  if (bytes < 1024) { return `${bytes} B`; }
  if (bytes < 1024 * 1024) { return `${(bytes / 1024).toFixed(1)} KB`; }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentModal = ({ document, onClose, onSaved }) => {
  const isEdit = Boolean(document);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState(document?.title ?? '');
  const [description, setDescription] = useState(document?.description ?? '');
  const [selectedType, setSelectedType] = useState(
    document?.document_type
      ? { value: document.document_type, label: document.document_type_name }
      : null,
  );
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!isEdit && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [isEdit]);

  const applyFile = (picked) => {
    if (!picked) { return; }
    const ext = picked.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`File type .${ext} is not supported.`);
      return;
    }
    setError('');
    setFile(picked);
    if (!title) { setTitle(picked.name.replace(/\.[^.]+$/, '')); }
  };

  const handleFileChange = (e) => applyFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    applyFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!isEdit && !file) { setError('Please select a file to upload.'); return; }

    setIsSaving(true);
    try {
      if (isEdit) {
        const payload = { title: title.trim(), description };
        payload.document_type = selectedType ? selectedType.value : null;
        await updateDocument(document.id, payload);
      } else {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('file', file);
        formData.append('description', description);
        if (selectedType) { formData.append('document_type', selectedType.value); }
        await uploadDocument(formData);
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.file?.[0] || 'Failed to save document.');
    } finally {
      setIsSaving(false);
    }
  };

  const submitLabel = isEdit ? 'Save Changes' : 'Upload';

  return (
    <ModalDialog
      title={isEdit ? 'Edit Document' : 'Upload Document'}
      isOpen
      onClose={onClose}
      size="lg"
      hasCloseButton
    >
      <ModalDialog.Header>
        <ModalDialog.Title>{isEdit ? 'Edit Document' : 'Upload Document'}</ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <Form id="document-form" onSubmit={handleSubmit}>
          {error && (
            <div className="doc-modal-error" role="alert">{error}</div>
          )}

          {/* ── File picker (create only) ── */}
          {!isEdit && (
            <div className="doc-modal-section">
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <div
                className={`doc-upload-zone${isDragOver ? ' doc-upload-zone--over' : ''}${file ? ' doc-upload-zone--filled' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload file"
              >
                {file ? (
                  <div className="doc-upload-preview">
                    <FontAwesomeIcon icon={faFile} className="doc-upload-preview-icon" />
                    <div className="doc-upload-preview-info">
                      <span className="doc-upload-preview-name">{file.name}</span>
                      <span className="doc-upload-preview-size">{formatBytes(file.size)}</span>
                    </div>
                    <button
                      type="button"
                      className="doc-upload-clear"
                      onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) { fileInputRef.current.value = ''; } }}
                      aria-label="Remove file"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ) : (
                  <div className="doc-upload-prompt">
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="doc-upload-icon" />
                    <p className="doc-upload-label">
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p className="doc-upload-hint">
                      Images, PDF, Word, Excel, PowerPoint, TXT, CSV, RTF, ZIP
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* ── Title ── */}
          <div className="doc-modal-section">
            <Form.Group>
              <Form.Label htmlFor="doc-title">
                Title <span aria-hidden="true" className="doc-required">*</span>
              </Form.Label>
              <Form.Control
                id="doc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a display name for this document"
                required
              />
            </Form.Group>
          </div>

          {/* ── Type + Description side by side ── */}
          <div className="doc-modal-row">
            <div className="doc-modal-col">
              <Form.Group>
                <Form.Label htmlFor="document-type-select">Document Type</Form.Label>
                <DocumentTypeSelect
                  inputId="document-type-select"
                  value={selectedType}
                  onChange={setSelectedType}
                  isDisabled={isSaving}
                />
              </Form.Group>
            </div>
          </div>

          {/* ── Description ── */}
          <div className="doc-modal-section">
            <Form.Group>
              <Form.Label htmlFor="doc-description">Description <span className="doc-optional">(optional)</span></Form.Label>
              <Form.Control
                id="doc-description"
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this document's contents…"
              />
            </Form.Group>
          </div>
        </Form>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="tertiary" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button
            variant="primary"
            type="submit"
            form="document-form"
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : submitLabel}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

DocumentModal.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    document_type: PropTypes.string,
    document_type_name: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

DocumentModal.defaultProps = {
  document: null,
};

export default DocumentModal;
