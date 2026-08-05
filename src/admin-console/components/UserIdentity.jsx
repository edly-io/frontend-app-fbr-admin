import React from 'react';
import PropTypes from 'prop-types';
import { Avatar } from '@openedx/paragon';

// NOTE: `badges` are role/status *values* passed in by callers (e.g. the
// already-localized-or-not role/status labels computed in each feature's
// `data/api.js`), not UI chrome owned by this component, so they are not
// routed through `intl.formatMessage` here. See the i18n-scope comment in
// `admin-console/users/constants.js` for why role/status labels intentionally
// stay plain English strings that this component pattern-matches on.
const ROLE_META = {
  'Super Admin': { tone: 'super-admin', code: 'SA' },
  Admin: { tone: 'admin', code: 'AD' },
  'Middle Admin': { tone: 'middle-admin', code: 'MA' },
  'Data Admin': { tone: 'data-admin', code: 'DA' },
  Instructor: { tone: 'instructor', code: 'IN' },
  Trainee: { tone: 'trainee', code: 'TR' },
  'Pending Approval': { tone: 'pending-approval', code: 'PA' },
};

const getBadgeTone = (badge) => {
  switch (badge) {
    case 'Super Admin':
      return 'super-admin';
    case 'Middle Admin':
      return 'middle-admin';
    case 'Data Admin':
      return 'data-admin';
    case 'Instructor':
      return 'instructor';
    case 'Trainee':
      return 'trainee';
    case 'Admin':
      return 'admin';
    case 'Pending Approval':
      return 'pending-approval';
    default:
      return 'default';
  }
};

const getRoleCode = badge => ROLE_META[badge]?.code || badge.slice(0, 2).toUpperCase();

const getAvatarText = (avatarValue, name) => {
  if (avatarValue) {
    return avatarValue;
  }

  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const UserIdentity = ({
  name,
  badges,
  size,
  avatarValue,
  showAvatar,
}) => {
  const visibleBadges = badges.filter(Boolean);
  const primaryBadge = visibleBadges[0] || '';
  const avatarText = getAvatarText(avatarValue, name);
  const avatarTone = getBadgeTone(primaryBadge);
  const roleCode = primaryBadge ? getRoleCode(primaryBadge) : '';
  const hasImage = String(avatarText).startsWith('http') || String(avatarText).startsWith('/');

  return (
    <div className={`user-identity user-identity--${size}`}>
      {showAvatar && (
        <div className={`user-identity__avatar-wrap user-identity__avatar-wrap--${size}`}>
          <div className={`user-identity__avatar-shell user-identity__avatar-shell--${size} user-identity__avatar-shell--${avatarTone}`}>
            <Avatar
              alt={name}
              size="md"
              src={hasImage ? avatarText : undefined}
              className={`user-identity__avatar-media ${!hasImage ? 'user-identity__avatar-media--placeholder' : ''}`}
            />
            {!hasImage && (
              <span className="user-identity__avatar-initials">{avatarText}</span>
            )}
          </div>
          {primaryBadge && (
            <span className={`user-identity__corner-badge user-identity__corner-badge--${avatarTone}`}>
              {roleCode}
            </span>
          )}
        </div>
      )}

      <div className="user-identity__content">
        <div className="user-identity__name">{name}</div>
        {primaryBadge && (
          <div className={`user-identity__role-label user-identity__role-label--${avatarTone}`}>
            {primaryBadge}
          </div>
        )}
      </div>
    </div>
  );
};

UserIdentity.propTypes = {
  name: PropTypes.string,
  badges: PropTypes.arrayOf(PropTypes.string),
  size: PropTypes.oneOf(['compact', 'default', 'large']),
  avatarValue: PropTypes.string,
  showAvatar: PropTypes.bool,
};

UserIdentity.defaultProps = {
  name: 'Unnamed user',
  badges: [],
  size: 'default',
  avatarValue: '',
  showAvatar: true,
};

export default UserIdentity;
