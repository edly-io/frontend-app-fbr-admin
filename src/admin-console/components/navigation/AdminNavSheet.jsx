import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Sheet } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminNavLinks from './AdminNavLinks';
import messages from '../../messages';

const SHEET_TITLE_ID = 'admin-nav-sheet-title';

/**
 * The console navigation in a bottom Paragon `Sheet`.
 *
 * `blocking` stays false because Paragon wires click-outside and Esc dismissal
 * to `onClose` only for non-blocking sheets, and its `FocusOn` wrapper then
 * supplies the focus trap, focus restore and background scroll lock. The skrim
 * `blocking` would have drawn is styled back in for this sheet in
 * `admin-nav-mobile-styles.scss`.
 *
 * Rendered only while open, so `show` is always true.
 */
const AdminNavSheet = ({
  isClosing, sections, badgeCounts, onClose,
}) => {
  const intl = useIntl();

  return (
    <Sheet
      position="bottom"
      blocking={false}
      show
      onClose={onClose}
      className={`admin-nav-sheet${isClosing ? ' admin-nav-sheet--closing' : ''}`}
      containerClassName={`admin-nav-sheet-container${isClosing ? ' admin-nav-sheet-container--closing' : ''}`}
    >
      <div className="admin-nav-sheet__grabber" />
      <div className="admin-nav-sheet__header d-flex align-items-center justify-content-between">
        <h2 id={SHEET_TITLE_ID} className="admin-nav-sheet__title h5 mb-0">
          {intl.formatMessage(messages.navMobileSheetTitle)}
        </h2>
        <IconButton
          iconAs={FontAwesomeIcon}
          icon={faTimes}
          alt={intl.formatMessage(messages.navMobileSheetClose)}
          size="sm"
          onClick={onClose}
        />
      </div>
      <nav className="admin-nav-sheet__nav" aria-labelledby={SHEET_TITLE_ID}>
        <AdminNavLinks
          sections={sections}
          badgeCounts={badgeCounts}
          withActiveIndicator
          onNavigate={onClose}
        />
      </nav>
    </Sheet>
  );
};

AdminNavSheet.propTypes = {
  isClosing: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  sections: PropTypes.array.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  badgeCounts: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdminNavSheet;
