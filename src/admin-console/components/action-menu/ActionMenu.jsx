import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../pages/users/messages';
import './action-menu-styles.scss';

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
    <div ref={ref} className="action-menu">
      <button
        type="button"
        className={`action-menu__toggle ${isOpen ? 'action-menu__toggle--open' : ''}`}
        onClick={() => setOpenId(isOpen ? null : userId)}
        aria-label={intl.formatMessage(messages.actionMenuToggle)}
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      {isOpen && (
        <div className="action-menu__dropdown">
          <button type="button" onClick={() => { setOpenId(null); onView(); }} className="action-menu__item">
            {intl.formatMessage(messages.actionMenuViewProfile)}
          </button>
          <button type="button" onClick={() => { setOpenId(null); onEdit(); }} className="action-menu__item">
            {intl.formatMessage(messages.actionMenuEditUser)}
          </button>
          <div className="action-menu__divider" />
          <button
            type="button"
            onClick={() => { setOpenId(null); onDeactivate(); }}
            className={`action-menu__item ${isActive ? 'action-menu__item--danger' : 'action-menu__item--success'}`}
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
