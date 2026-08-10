import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Sheet } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { UserIdentity } from '@edly-io/frontend-component-fbr';

/**
 * Right-side panel listing a set of people (instructors, certificate
 * recipients, ...) associated with a program row. Opened from a clickable
 * count cell in `ReportDataTable` - which people/labels/copy to show is
 * fully driven by props so the same Sheet backs every "count of people"
 * column (see `PEOPLE_SHEET_CONFIG` in `constants.js`). Each person is
 * rendered with the shared `UserIdentity` component (name, avatar and role
 * badge).
 */
const PeopleSheet = ({
  show, program, people, badgeLabel, eyebrow, emptyText, closeLabel, onClose,
}) => (
  <Sheet position="right" show={show} onClose={onClose} className="people-sheet">
    <div className="people-sheet__header d-flex align-items-start justify-content-between">
      <div className="people-sheet__heading">
        <p className="people-sheet__eyebrow text-uppercase mb-1">{eyebrow}</p>
        <h2 className="people-sheet__title h5 fw-bold mb-0">{program}</h2>
      </div>
      <IconButton
        iconAs={FontAwesomeIcon}
        icon={faTimes}
        alt={closeLabel}
        size="sm"
        onClick={onClose}
      />
    </div>

    {people.length === 0 ? (
      <p className="people-sheet__empty text-muted mb-0">{emptyText}</p>
    ) : (
      <ul className="people-sheet__list list-unstyled mb-0">
        {people.map(person => (
          <li key={person.id} className="people-sheet__item">
            <UserIdentity
              name={person.name}
              badges={[badgeLabel]}
              size="default"
              avatarValue={person.avatarValue}
              showAvatar
              enableHoverCard={false}
            />
          </li>
        ))}
      </ul>
    )}
  </Sheet>
);

PeopleSheet.propTypes = {
  show: PropTypes.bool.isRequired,
  program: PropTypes.string.isRequired,
  people: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatarValue: PropTypes.string,
  })).isRequired,
  badgeLabel: PropTypes.string.isRequired,
  eyebrow: PropTypes.string.isRequired,
  emptyText: PropTypes.string.isRequired,
  closeLabel: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PeopleSheet;
