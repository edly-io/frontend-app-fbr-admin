import React, { useCallback } from 'react';
import { Badge } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminNavSheet from './AdminNavSheet';
import { NAV_ITEM_LABEL_MESSAGES, SECTION_TITLE_MESSAGES } from './AdminNavLinks';
import useAdminNavigation from './useAdminNavigation';
import useNavSheetVisibility from './useNavSheetVisibility';
import messages from '../../messages';
import './admin-nav-mobile-styles.scss';

/**
 * Sticky trigger that replaces the desktop rail below `lg`: shows the current
 * section and page with pending counts rolled up, and opens the full navigation
 * in a bottom sheet. Its visibility is owned by the stylesheet, from the same
 * query that hides the sidebar.
 */
const AdminNavContextBar = () => {
  const intl = useIntl();
  const {
    sections, badgeCounts, totalBadgeCount, activeItem, activeSectionId,
  } = useAdminNavigation();
  const {
    isMounted, isClosing, isOpen, open, close,
  } = useNavSheetVisibility();

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Routes outside the nav (the placeholder pages) have no section of their own.
  const sectionLabel = intl.formatMessage(
    SECTION_TITLE_MESSAGES[activeSectionId] || messages.navSectionAdministration,
  );
  const pageLabel = activeItem
    ? intl.formatMessage(NAV_ITEM_LABEL_MESSAGES[activeItem.id])
    : intl.formatMessage(messages.navMobileNoActiveSection);

  return (
    <div className="admin-nav-context-bar">
      <button
        type="button"
        className="admin-nav-context-bar__trigger d-flex align-items-center"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={intl.formatMessage(messages.navMobileTriggerLabel, {
          section: sectionLabel,
          page: pageLabel,
          count: totalBadgeCount,
        })}
        onClick={toggle}
      >
        <FontAwesomeIcon icon={faBars} className="admin-nav-context-bar__menu-icon" />
        <span className="admin-nav-context-bar__labels d-flex align-items-baseline">
          <span className="admin-nav-context-bar__section">{sectionLabel}</span>
          <span className="admin-nav-context-bar__divider">/</span>
          <span className="admin-nav-context-bar__page">{pageLabel}</span>
        </span>
        {totalBadgeCount > 0 && (
          // The count is already spelled out in the trigger's accessible name.
          <Badge pill variant="danger" className="admin-nav-context-bar__badge" aria-hidden="true">
            {totalBadgeCount}
          </Badge>
        )}
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`admin-nav-context-bar__chevron${isOpen ? ' admin-nav-context-bar__chevron--open' : ''}`}
        />
      </button>

      {isMounted && (
        <AdminNavSheet
          isClosing={isClosing}
          sections={sections}
          badgeCounts={badgeCounts}
          onClose={close}
        />
      )}
    </div>
  );
};

export default AdminNavContextBar;
