import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Alert, Button, ModalDialog, breakpoints, useMediaQuery,
} from '@openedx/paragon';
import { updateAnnouncement } from './api';
import DatepickerControl from '../shared/date-picker-control/DatepickerControl';
import './EditBannerExpiryModal.css';

const todayIsoDate = () => new Date().toISOString().split('T')[0];

const toDateInput = (isoString) => {
  if (!isoString) { return ''; }
  return isoString.split('T')[0];
};

const EditBannerExpiryModal = ({ item, onClose, onSaved }) => {
  const [expiresAt, setExpiresAt] = useState(toDateInput(item.banner_expires_at));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isMobile = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });

  const handleSave = async () => {
    if (!expiresAt) { setError('Please select an expiry date.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await updateAnnouncement(item.id, { banner_expires_at: expiresAt });
      onSaved();
    } catch (err) {
      const detail = err?.response?.data?.banner_expires_at
        || err?.response?.data?.detail
        || 'Failed to update expiry date.';
      setError(Array.isArray(detail) ? detail.join(' ') : detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalDialog
      title="Edit Banner Expiry"
      isOpen
      onClose={onClose}
      size="sm"
      isFullscreenOnMobile
      hasCloseButton={!submitting}
      isBlocking={submitting}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>Edit Banner Expiry</ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <p className="text-muted font-italic small mb-3">{item.subject}</p>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        <div className="eexp-field">
          <label htmlFor="eexp-date" className="eexp-label">
            Banner Expiry Date *
            <span className="eexp-label-note"> — banner stops showing after this date</span>
          </label>
          <DatepickerControl
            renderGroup={false}
            id="eexp-date"
            dataTestId="eexp-date"
            controlName="eexp-date"
            value={expiresAt}
            minDate={todayIsoDate()}
            required
            onChange={setExpiresAt}
          />
        </div>
        {expiresAt && !item.banner_active && (
          <Alert variant="success" className="mt-3 mb-0">
            Saving a future expiry date will reactivate this banner.
          </Alert>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow isStacked={isMobile}>
          <Button variant="outline-primary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={submitting || !expiresAt}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

EditBannerExpiryModal.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    subject: PropTypes.string,
    banner_expires_at: PropTypes.string,
    banner_active: PropTypes.bool,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

export default EditBannerExpiryModal;
