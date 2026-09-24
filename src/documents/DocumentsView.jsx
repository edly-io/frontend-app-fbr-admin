import React, { useCallback, useEffect, useState } from 'react';
import {
  ActionRow, Button, DataTable, Form, Icon, IconButton, ModalDialog, OverlayTrigger,
  Pagination, Tooltip,
} from '@openedx/paragon';
import {
  Delete, Edit as EditIcon, Link as LinkIcon, Lock, LockOpen, Visibility,
} from '@openedx/paragon/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faFileImage, faFilePdf, faFileArchive, faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { getConfig } from '@edx/frontend-platform';
import UserIdentity from '../admin-console/components/UserIdentity';
import {
  listDocuments, deleteDocument, listDocumentTypes, updateDocument,
} from './api';
import DocumentModal from './DocumentModal';
import DebouncedSearchInput from '../admin-console/components/debounced-search-input/DebouncedSearchInput';
import './DocumentsView.scss';

// Each entry carries the hue its pastel is built from, so the dark variant can
// keep a type's identity instead of collapsing every badge onto one grey.
const BADGE_PALETTES = [
  { background: '#dbeafe', color: '#1e40af', hue: 217 }, // blue
  { background: '#d1fae5', color: '#065f46', hue: 160 }, // green
  { background: '#fce7f3', color: '#9d174d', hue: 330 }, // pink
  { background: '#fef3c7', color: '#92400e', hue: 40 }, // amber
  { background: '#ede9fe', color: '#5b21b6', hue: 260 }, // violet
  { background: '#ffedd5', color: '#9a3412', hue: 28 }, // orange
  { background: '#e0f2fe', color: '#075985', hue: 200 }, // sky
  { background: '#ecfdf5', color: '#047857', hue: 165 }, // emerald
  { background: '#fdf4ff', color: '#86198f', hue: 295 }, // fuchsia
  { background: '#fff1f2', color: '#9f1239', hue: 350 }, // rose
  { background: '#f0fdf4', color: '#166534', hue: 145 }, // lime
  { background: '#fefce8', color: '#854d0e', hue: 50 }, // yellow
  { background: '#f0f9ff', color: '#0c4a6e', hue: 204 }, // light blue
  { background: '#fdf2f8', color: '#701a75', hue: 310 }, // purple-pink
  { background: '#f7fee7', color: '#3f6212', hue: 85 }, // lime green
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

// The pastel is handed to CSS rather than set as `background`/`color`, so the
// dark rule can rebuild the badge from the same hue instead of being outranked
// by an inline style.
const badgeVars = (name) => {
  const palette = getBadgeStyle(name);
  return {
    '--docs-badge-bg': palette.background,
    '--docs-badge-fg': palette.color,
    '--docs-badge-hue': palette.hue,
  };
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

const ROLE_DISPLAY = {
  super_admin: 'Super Admin',
  middle_admin: 'Middle Admin',
  data_admin: 'Data Admin',
  instructor: 'Instructor',
  trainee: 'Trainee',
};

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

  // Cell renderers keep the markup the hand-written table used, so the rows read
  // exactly as before; only the table around them is Paragon's now.
  const TitleCell = ({ row }) => {
    const doc = row.original;
    const fileType = getFileTypeInfo(doc);
    return (
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
    );
  };

  const TypeCell = ({ row }) => {
    const name = row.original.document_type_name;
    if (!name) { return <span className="docs-td-muted">—</span>; }
    return (
      <span className="docs-type-badge" style={badgeVars(name)}>
        {name}
      </span>
    );
  };

  const UploaderCell = ({ row }) => (row.original.uploaded_by_name ? (
    <UserIdentity
      name={row.original.uploaded_by_name}
      badges={[ROLE_DISPLAY[row.original.uploaded_by_role]].filter(Boolean)}
      size="compact"
      showAvatar
    />
  ) : '—');

  const ActionsCell = ({ row }) => {
    const doc = row.original;
    return (
      <div className="docs-action-group d-flex align-items-center">
        <OverlayTrigger placement="top" overlay={<Tooltip id={`preview-${doc.id}`}>Preview</Tooltip>}>
          <IconButton
            src={Visibility}
            iconAs={Icon}
            size="sm"
            alt="Preview document"
            onClick={() => handlePreview(doc)}
          />
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={<Tooltip id={`copy-${doc.id}`}>Copy link</Tooltip>}>
          <IconButton
            src={LinkIcon}
            iconAs={Icon}
            size="sm"
            alt="Copy shareable link"
            onClick={() => handleCopyLink(doc)}
          />
        </OverlayTrigger>
        <OverlayTrigger
          placement="top"
          overlay={(
            <Tooltip id={`vis-${doc.id}`}>
              {doc.is_public
                ? 'Make private — only FBR users (admins, instructors, trainees) can view after logging in'
                : 'Make public — anyone can view without logging in'}
            </Tooltip>
          )}
        >
          <IconButton
            src={doc.is_public ? LockOpen : Lock}
            iconAs={Icon}
            size="sm"
            variant={doc.is_public ? 'success' : 'primary'}
            alt={doc.is_public ? 'Set document to private' : 'Set document to public'}
            onClick={() => handleToggleVisibility(doc)}
          />
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={<Tooltip id={`edit-${doc.id}`}>Edit</Tooltip>}>
          <IconButton
            src={EditIcon}
            iconAs={Icon}
            size="sm"
            alt="Edit document"
            onClick={() => openEdit(doc)}
          />
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={<Tooltip id={`delete-${doc.id}`}>Delete</Tooltip>}>
          <IconButton
            src={Delete}
            iconAs={Icon}
            size="sm"
            variant="danger"
            alt="Delete document"
            onClick={() => setDeleteModalDoc(doc)}
          />
        </OverlayTrigger>
      </div>
    );
  };

  // Widths that were inline `style` attributes on the old `th`s now travel with
  // the column, so header and body stay in step.
  const columns = [
    { Header: 'Title', accessor: 'title', Cell: TitleCell },
    {
      Header: 'Type', id: 'type', Cell: TypeCell, cellClassName: 'docs-col--type', headerClassName: 'docs-col--type',
    },
    {
      Header: 'Size',
      id: 'size',
      Cell: ({ row }) => formatBytes(row.original.file_size),
      cellClassName: 'docs-col--size docs-td-mono',
      headerClassName: 'docs-col--size',
    },
    {
      Header: 'Uploaded by', id: 'uploader', Cell: UploaderCell, cellClassName: 'docs-col--uploader', headerClassName: 'docs-col--uploader',
    },
    {
      Header: 'Date',
      id: 'date',
      Cell: ({ row }) => formatDate(row.original.created),
      cellClassName: 'docs-col--date docs-td-mono',
      headerClassName: 'docs-col--date',
    },
    {
      Header: 'Actions', id: 'actions', Cell: ActionsCell, cellClassName: 'docs-col--actions', headerClassName: 'docs-col--actions docs-th--center',
    },
  ];


  return (
    <>
      {/* ── Page header ── */}
      <div className="docs-page-header d-flex flex-column flex-md-row align-items-start justify-content-md-between">
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
        <DataTable
          isLoading={isLoading}
          data={documents}
          itemCount={totalCount}
          columns={columns}
        >
          <div className="docs-table-wrap">
            <DataTable.Table />
            <DataTable.EmptyTable content="No documents found." />
          </div>
        </DataTable>

        {/* ── Pagination ── */}
        {numPages > 1 && (
          <div className="docs-pagination">
            <Pagination
              paginationLabel="Documents pagination"
              pageCount={numPages}
              currentPage={currentPage}
              onPageSelect={(page) => fetchDocuments(page)}
              size="small"
              variant="secondary"
            />
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
                    style={badgeVars(deleteModalDoc.document_type_name)}
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
              <Button variant="outline-primary" onClick={() => setDeleteModalDoc(null)} disabled={isDeleting}>
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
