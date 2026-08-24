import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from '@openedx/paragon';
import { updateAnnouncement } from './api';
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
    <div className="eexp-overlay" role="dialog" aria-modal="true" aria-label="Edit banner expiry">
      <div className="eexp-modal">
        <div className="eexp-header">
          <h2 className="eexp-title">Edit Banner Expiry</h2>
          <button type="button" onClick={onClose} className="eexp-close-btn" aria-label="Close">×</button>
        </div>

        <div className="eexp-body">
          <p className="eexp-subject">{item.subject}</p>
          {error && <div className="eexp-error">{error}</div>}
          <div className="eexp-field">
            <label htmlFor="eexp-date" className="eexp-label">
              Banner Expiry Date *
              <span className="eexp-label-note"> — banner stops showing after this date</span>
            </label>
            <Form.Control
              id="eexp-date"
              type="date"
              value={expiresAt}
              min={todayIsoDate()}
              onChange={e => setExpiresAt(e.target.value)}
            />
          </div>
          {expiresAt && !item.banner_active && (
            <p className="eexp-note">
              Saving a future expiry date will reactivate this banner.
            </p>
          )}
        </div>

        <div className="eexp-footer">
          <Button variant="tertiary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={submitting || !expiresAt}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
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
