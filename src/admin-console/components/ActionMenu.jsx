import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../users/messages';

const MENU_ITEM = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '8px 16px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '13.5px',
  color: 'var(--pgn-color-gray-900)',
};

const ActionMenu = ({
  userId, userStatus, onView, onEdit, onDeactivate, openId, setOpenId,
}) => {
  const intl = useIntl();
  const ref = useRef(null);
  const isOpen = openId === userId;
  const isActive = userStatus === 'Active';

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, [isOpen, setOpenId]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpenId(isOpen ? null : userId)}
        aria-label={intl.formatMessage(messages.actionMenuToggle)}
        style={{
          background: 'none',
          border: isOpen ? '1.5px solid var(--pgn-color-primary-base)' : '1px solid var(--pgn-color-border)',
          borderRadius: '5px',
          cursor: 'pointer',
          padding: '4px 8px',
          color: isOpen ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-text-light)',
          lineHeight: 1,
        }}
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', border: '1px solid var(--pgn-color-border)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, minWidth: '160px', padding: '4px 0',
        }}
        >
          <button type="button" onClick={() => { setOpenId(null); onView(); }} style={MENU_ITEM}>
            {intl.formatMessage(messages.actionMenuViewProfile)}
          </button>
          <button type="button" onClick={() => { setOpenId(null); onEdit(); }} style={MENU_ITEM}>
            {intl.formatMessage(messages.actionMenuEditUser)}
          </button>
          <div style={{ borderTop: '1px solid var(--pgn-color-gray-100)', margin: '4px 0' }} />
          <button
            type="button"
            onClick={() => { setOpenId(null); onDeactivate(); }}
            style={{ ...MENU_ITEM, color: isActive ? 'var(--pgn-color-red)' : 'var(--pgn-color-green)' }}
          >
            {isActive
              ? intl.formatMessage(messages.actionMenuDeactivate)
              : intl.formatMessage(messages.actionMenuActivate)}
          </button>
        </div>
      )}
    </div>
  );
};

ActionMenu.propTypes = {
  userId: PropTypes.number.isRequired,
  userStatus: PropTypes.string.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  openId: PropTypes.number,
  setOpenId: PropTypes.func.isRequired,
};

ActionMenu.defaultProps = {
  openId: null,
};

export default ActionMenu;
