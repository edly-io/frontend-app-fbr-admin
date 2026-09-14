import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Icon, IconButton } from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../pages/users/messages';
import './action-menu-styles.scss';

const ActionMenu = ({
  userId, userStatus, onView, onEdit, onDeactivate, openId, setOpenId,
}) => {
  const intl = useIntl();
  const isOpen = openId === userId;
  const isActive = userStatus === 'Active';

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
        alt={intl.formatMessage(messages.actionMenuToggle)}
      />
      <Dropdown.Menu alignRight className="action-menu__menu">
        <Dropdown.Item onClick={onView}>
          {intl.formatMessage(messages.actionMenuViewProfile)}
        </Dropdown.Item>
        <Dropdown.Item onClick={onEdit}>
          {intl.formatMessage(messages.actionMenuEditUser)}
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          className={isActive ? 'action-menu__item--danger' : 'action-menu__item--success'}
          onClick={onDeactivate}
        >
          {isActive
            ? intl.formatMessage(messages.actionMenuDeactivate)
            : intl.formatMessage(messages.actionMenuActivate)}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
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
