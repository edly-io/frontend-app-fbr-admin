import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Icon, IconButton } from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../pages/users/messages';
import './action-menu-styles.scss';

const ActionMenu = ({
  userId, userName, userStatus, canChangeStatus, onView, onEdit, editHref, onDeactivate, openId, setOpenId,
}) => {
  const intl = useIntl();
  const isOpen = openId === userId;
  const isActive = userStatus === 'Active';
  const withName = (message) => {
    const action = intl.formatMessage(message);
    return {
      children: action,
      'aria-label': userName ? intl.formatMessage(messages.rowActionLabel, { action, name: userName }) : undefined,
    };
  };
  const statusAction = withName(isActive ? messages.actionMenuDeactivate : messages.actionMenuActivate);
  // Deactivate/Activate is admin-triggered only between Active and Deactivated.
  // Invited users auto-activate on first login; other statuses (On Leave,
  // Programme Closed, Lapsed) have their own flows — hide the toggle for all
  // of them so admins can't trigger an endpoint call that will fail. The same
  // goes for people the caller may not manage (canChangeStatus, from the API).
  const canToggleStatus = canChangeStatus && (isActive || userStatus === 'Deactivated');

  return (
    <Dropdown
      className="action-menu"
      show={isOpen}
      onToggle={next => setOpenId(next ? userId : null)}
    >
      <Dropdown.Toggle
        as={IconButton}
        id={`user-actions-${userId}`}
        src={MoreVert}
        iconAs={Icon}
        size="sm"
        alt={userName
          ? intl.formatMessage(messages.actionMenuToggleFor, { name: userName })
          : intl.formatMessage(messages.actionMenuToggle)}
      />
      <Dropdown.Menu alignRight className="action-menu__menu">
        <Dropdown.Item onClick={onView} {...withName(messages.actionMenuViewProfile)} />
        <Dropdown.Item
          {...(editHref
            ? {
              as: 'a', href: editHref, target: '_blank', rel: 'noopener noreferrer',
            }
            : { onClick: onEdit })}
          {...withName(messages.actionMenuEditUser)}
        />
        {canToggleStatus && (
          <>
            <Dropdown.Divider />
            <Dropdown.Item
              className={isActive ? 'action-menu__item--danger' : 'action-menu__item--success'}
              onClick={onDeactivate}
              aria-label={statusAction['aria-label']}
            >
              {statusAction.children}
            </Dropdown.Item>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

ActionMenu.propTypes = {
  userId: PropTypes.number.isRequired,
  userName: PropTypes.string,
  userStatus: PropTypes.string.isRequired,
  canChangeStatus: PropTypes.bool.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  // When set, Edit renders as a link to the profile MFE instead of a button.
  editHref: PropTypes.string,
  onDeactivate: PropTypes.func.isRequired,
  openId: PropTypes.number,
  setOpenId: PropTypes.func.isRequired,
};

ActionMenu.defaultProps = {
  editHref: null,
  userName: null,
  openId: null,
};

export default ActionMenu;
