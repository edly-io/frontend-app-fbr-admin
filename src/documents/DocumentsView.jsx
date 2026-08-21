import React, { useCallback, useEffect, useState } from 'react';
import {
  ActionRow, Button, Form, ModalDialog, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faEdit, faTrash, faLink, faChevronLeft, faChevronRight,
  faEye, faFileImage, faFilePdf, faFileArchive, faFileAlt,
  faLock, faLockOpen,
} from '@fortawesome/free-solid-svg-icons';
import { getConfig } from '@edx/frontend-platform';
import {
  listDocuments, deleteDocument, listDocumentTypes, updateDocument,
} from './api';
import DocumentModal from './DocumentModal';
import DebouncedSearchInput from '../admin-console/components/debounced-search-input/DebouncedSearchInput';
import './DocumentsView.css';

const BADGE_PALETTES = [
  { background: '#dbeafe', color: '#1e40af' }, // blue
  { background: '#d1fae5', color: '#065f46' }, // green
  { background: '#fce7f3', color: '#9d174d' }, // pink
  { background: '#fef3c7', color: '#92400e' }, // amber
  { background: '#ede9fe', color: '#5b21b6' }, // violet
  { background: '#ffedd5', color: '#9a3412' }, // orange
  { background: '#e0f2fe', color: '#075985' }, // sky
  { background: '#ecfdf5', color: '#047857' }, // emerald
  { background: '#fdf4ff', color: '#86198f' }, // fuchsia
  { background: '#fff1f2', color: '#9f1239' }, // rose
  { background: '#f0fdf4', color: '#166534' }, // lime
  { background: '#fefce8', color: '#854d0e' }, // yellow
  { background: '#f0f9ff', color: '#0c4a6e' }, // light blue
  { background: '#fdf2f8', color: '#701a75' }, // purple-pink
  { background: '#f7fee7', color: '#3f6212' }, // lime green
];

const getBadgeStyle = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash |= 0;
  }
  return BADGE_PALETTES[Math.abs(hash) % BADGE_PALETTES.length];
};

const getFileTypeInfo = (doc) => {
  const ext = (doc.original_filename || '').split('.').pop().toLowerCase();
  const ct = (doc.content_type || '').toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || ct.startsWith('image/')) {
    return { icon: faFileImage, color: '#0891b2' };
  }
  if (ext === 'pdf' || ct === 'application/pdf') {
    return { icon: faFilePdf, color: '#dc2626' };
  }
  if (ext === 'zip' || ct === 'application/zip') {
    return { icon: faFileArchive, color: '#d97706' };
  }
  return { icon: faFileAlt, color: '#6b7280' };
};

const formatBytes = (bytes) => {
  if (!bytes) { return '—'; }
  if (bytes < 1024) { return `${bytes} B`; }
  if (bytes < 1024 * 1024) { return `${(bytes / 1024).toFixed(1)} KB`; }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (val) => (val ? new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const DocumentsView = () => {
  const [documents, setDocuments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyToast, setCopyToast] = useState('');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [docTypes, setDocTypes] = useState([]);

  const [modalDoc, setModalDoc] = useState(undefined);
  const [showModal, setShowModal] = useState(false);

  const [deleteModalDoc, setDeleteModalDoc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocTypes = useCallback(async () => {
    try {
      const { data } = await listDocumentTypes();
      setDocTypes(Array.isArray(data) ? data : []);
    } catch {
      // silently ignore
    }
  }, []);

  const fetchDocuments = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await listDocuments({ search, documentType: typeFilter, page });
      setDocuments(data.results ?? []);
      setTotalCount(data.count ?? 0);
      setNumPages(data.num_pages ?? 1);
      setCurrentPage(data.current_page ?? 1);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to load documents.');
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => { fetchDocTypes(); }, [fetchDocTypes]);
  useEffect(() => { fetchDocuments(1); }, [fetchDocuments]);

  const handleDelete = async () => {
    if (!deleteModalDoc) { return; }
    setIsDeleting(true);
    try {
      await deleteDocument(deleteModalDoc.id);
      setDeleteModalDoc(null);
      fetchDocuments(currentPage);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete document.');
      setDeleteModalDoc(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (doc) => {
    const url = `${getConfig().LMS_BASE_URL}/fbr/documents/${doc.id}/`;
    const showToast = () => {
      setCopyToast(`Link copied for "${doc.title}"`);
      setTimeout(() => setCopyToast(''), 3000);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(showToast);
    } else {
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showToast();
    }
  };

  const handlePreview = (doc) => {
    const url = `${getConfig().LMS_BASE_URL}/fbr/documents/${doc.id}/`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaved = () => {
    setShowModal(false);
    setModalDoc(undefined);
    fetchDocuments(currentPage);
  };

  const handleToggleVisibility = async (doc) => {
    try {
      await updateDocument(doc.id, { is_public: !doc.is_public });
      fetchDocuments(currentPage);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update visibility.');
    }
  };

  const openCreate = () => { setModalDoc(null); setShowModal(true); };
  const openEdit = (doc) => { setModalDoc(doc); setShowModal(true); };

  return (
    <>
      {/* ── Page header ── */}
      <div className="docs-page-header">
        <div>
          <p className="docs-breadcrumb">
            <span>Communications</span>
            <span className="docs-breadcrumb-sep">/</span>
            <span className="docs-breadcrumb-active">Documents</span>
          </p>
          <h1 className="docs-view-title">Documents</h1>
          <p className="docs-view-desc">
            Upload and share files platform-wide. Copy a link and share it via announcements,
            emails, or course content — any authenticated user can view it.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate} className="docs-create-btn">
          <FontAwesomeIcon icon={faPlus} className="docs-create-btn-icon" />
          Upload Document
        </Button>
      </div>

      {/* ── Toolbar ── */}
      <div className="docs-toolbar">
        <DebouncedSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by title or filename…"
          width="280px"
        />
        <Form.Control
          as="select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="docs-type-filter"
        >
          <option value="">All types</option>
          {docTypes.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Form.Control>
        <span className="docs-count-label">
          {isLoading ? 'Loading…' : `${totalCount} document${totalCount !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="docs-alert docs-alert--error">{error}</div>
      )}
      {copyToast && (
        <div className="docs-alert docs-alert--success">{copyToast}</div>
      )}

      {/* ── Table card ── */}
      <div className="docs-card">
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead>
              <tr className="docs-thead-row">
                <th className="docs-th">Title</th>
                <th className="docs-th" style={{ width: '140px' }}>Type</th>
                <th className="docs-th" style={{ width: '85px' }}>Size</th>
                <th className="docs-th" style={{ width: '130px' }}>Uploaded by</th>
                <th className="docs-th" style={{ width: '110px' }}>Date</th>
                <th className="docs-th docs-th--center" style={{ width: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  <td colSpan={6} className="docs-td-empty">
                    <div className="docs-loading-dots" aria-label="Loading" role="status">
                      <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && documents.length === 0 && (
                <tr>
                  <td colSpan={6} className="docs-td-empty">
                    <div className="docs-empty-state">
                      <FontAwesomeIcon icon={faFileAlt} className="docs-empty-icon" />
                      <p>No documents found.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && documents.map((doc) => {
                const fileType = getFileTypeInfo(doc);
                return (
                  <tr key={doc.id} className="docs-row">
                    <td className="docs-td-title">
                      <div className="docs-title-cell">
                        <span className="docs-file-icon" style={{ color: fileType.color }}>
                          <FontAwesomeIcon icon={fileType.icon} />
                        </span>
                        <div>
                          <span className="docs-doc-title">{doc.title}</span>
                          {doc.original_filename !== doc.title && (
                            <span className="docs-doc-filename">{doc.original_filename}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="docs-td">
                      {doc.document_type_name ? (
                        <span
                          className="docs-type-badge"
                          style={getBadgeStyle(doc.document_type_name)}
                        >
                          {doc.document_type_name}
                        </span>
                      ) : (
                        <span className="docs-td-muted">—</span>
                      )}
                    </td>
                    <td className="docs-td docs-td-mono">{formatBytes(doc.file_size)}</td>
                    <td className="docs-td">{doc.uploaded_by_name || '—'}</td>
                    <td className="docs-td docs-td-mono">{formatDate(doc.created)}</td>
                    <td className="docs-td-actions">
                      <div className="docs-action-group">
                        <OverlayTrigger placement="top" overlay={<Tooltip id={`preview-${doc.id}`}>Preview</Tooltip>}>
                          <button
                            type="button"
                            className="docs-action-btn docs-action-btn--preview"
                            onClick={() => handlePreview(doc)}
                            aria-label="Preview document"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip id={`copy-${doc.id}`}>Copy link</Tooltip>}>
                          <button
                            type="button"
                            className="docs-action-btn docs-action-btn--link"
                            onClick={() => handleCopyLink(doc)}
                            aria-label="Copy shareable link"
                          >
                            <FontAwesomeIcon icon={faLink} />
                          </button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={(
                            <Tooltip id={`vis-${doc.id}`}>
                              {doc.is_public
                                ? 'Make private — only FBR members can view'
                                : 'Make public — anyone can view without logging in'}
                            </Tooltip>
                          )}
                        >
                          <button
                            type="button"
                            className={`docs-action-btn docs-action-btn--visibility${doc.is_public ? ' docs-action-btn--public' : ''}`}
                            onClick={() => handleToggleVisibility(doc)}
                            aria-label={doc.is_public ? 'Set document to private' : 'Set document to public'}
                          >
                            <FontAwesomeIcon icon={doc.is_public ? faLockOpen : faLock} />
                          </button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip id={`edit-${doc.id}`}>Edit</Tooltip>}>
                          <button
                            type="button"
                            className="docs-action-btn docs-action-btn--edit"
                            onClick={() => openEdit(doc)}
                            aria-label="Edit document"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip id={`delete-${doc.id}`}>Delete</Tooltip>}>
                          <button
                            type="button"
                            className="docs-action-btn docs-action-btn--delete"
                            onClick={() => setDeleteModalDoc(doc)}
                            aria-label="Delete document"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {numPages > 1 && (
          <div className="docs-pagination">
            <button
              type="button"
              className="docs-page-btn"
              onClick={() => fetchDocuments(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
              <span>Prev</span>
            </button>
            <span className="docs-page-info">
              Page <strong>{currentPage}</strong> of <strong>{numPages}</strong>
            </span>
            <button
              type="button"
              className="docs-page-btn"
              onClick={() => fetchDocuments(currentPage + 1)}
              disabled={currentPage >= numPages}
              aria-label="Next page"
            >
              <span>Next</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>

      {/* ── Upload / Edit modal ── */}
      {showModal && (
        <DocumentModal
          document={modalDoc}
          onClose={() => { setShowModal(false); setModalDoc(undefined); }}
          onSaved={handleSaved}
        />
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteModalDoc && (
        <ModalDialog
          title="Delete Document"
          isOpen
          onClose={() => setDeleteModalDoc(null)}
          size="sm"
          hasCloseButton
        >
          <ModalDialog.Header>
            <ModalDialog.Title>Delete Document</ModalDialog.Title>
          </ModalDialog.Header>
          <ModalDialog.Body>
            <p className="mb-2">
              Are you sure you want to delete <strong>{deleteModalDoc.title}</strong>?
            </p>
            <div className="docs-delete-details">
              {deleteModalDoc.original_filename !== deleteModalDoc.title && (
                <div className="docs-delete-detail-row">
                  <span className="docs-delete-detail-label">File</span>
                  <span>{deleteModalDoc.original_filename}</span>
                </div>
              )}
              {deleteModalDoc.document_type_name && (
                <div className="docs-delete-detail-row">
                  <span className="docs-delete-detail-label">Type</span>
                  <span
                    className="docs-type-badge"
                    style={getBadgeStyle(deleteModalDoc.document_type_name)}
                  >
                    {deleteModalDoc.document_type_name}
                  </span>
                </div>
              )}
              <div className="docs-delete-detail-row">
                <span className="docs-delete-detail-label">Size</span>
                <span>{formatBytes(deleteModalDoc.file_size)}</span>
              </div>
            </div>
            <p className="docs-delete-warning">
              This will permanently delete the file. Anyone visiting a shared link will see a
              &ldquo;document not available&rdquo; notice.
            </p>
          </ModalDialog.Body>
          <ModalDialog.Footer>
            <ActionRow>
              <Button variant="tertiary" onClick={() => setDeleteModalDoc(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting…' : 'Delete'}
              </Button>
            </ActionRow>
          </ModalDialog.Footer>
        </ModalDialog>
      )}
    </>
  );
};

export default DocumentsView;
