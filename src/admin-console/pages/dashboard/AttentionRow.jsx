import React, { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Icon } from '@openedx/paragon';
import { ChevronRight, ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import { TONE_COLORS, TONE_SURFACES } from './constants';

/**
 * One row of the Needs attention list, at any depth.
 *
 * A row does exactly one thing, decided by its data: children means it expands,
 * a destination means it navigates, neither means it is not interactive. The
 * chevron says which before the click - right leaves the page, down opens in
 * place, up closes again. Children are the same component, so every level
 * behaves identically.
 *
 * `isGroup` is the exception: a heading whose children are always on screen. It
 * labels the rows beneath it without being a control of its own, so it costs no
 * click and leaves the depth a reader has to click through unchanged.
 */
const MAX_INDENT_LEVEL = 3;

const AttentionRow = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const childrenId = useId();

  const {
    icon, tone, count, eyebrow, title, description, to, href, children, isGroup,
  } = node;
  const hasChildren = Boolean(children?.length);
  const isExpandable = hasChildren && !isGroup;
  const isNavigable = Boolean(to || href);

  const chevron = (() => {
    if (isExpandable) { return isOpen ? ExpandLess : ExpandMore; }
    return ChevronRight;
  })();

  const content = (
    <>
      {icon && (
        <span
          className="dashboard-attention__icon"
          style={{ backgroundColor: TONE_SURFACES[tone], color: TONE_COLORS[tone] }}
        >
          <Icon src={icon} aria-hidden />
        </span>
      )}

      {count !== undefined && (
        <span className="dashboard-attention__count" style={{ color: TONE_COLORS[tone] }}>
          {count}
        </span>
      )}

      <span className="dashboard-attention__text">
        {eyebrow && <span className="dashboard-attention__eyebrow">{eyebrow}</span>}
        <span className="dashboard-attention__item-title">{title}</span>
        {description && (
          <span className="dashboard-attention__item-description">{description}</span>
        )}
      </span>

      {(isExpandable || isNavigable) && (
        <Icon src={chevron} className="dashboard-attention__chevron" aria-hidden />
      )}
    </>
  );

  const rowClassName = `dashboard-attention__row dashboard-attention__row--level-${
    Math.min(level, MAX_INDENT_LEVEL)
  }${isGroup ? ' dashboard-attention__row--group' : ''} d-flex align-items-center`;

  const renderRow = () => {
    if (isExpandable) {
      return (
        <button
          type="button"
          className={rowClassName}
          aria-expanded={isOpen}
          aria-controls={childrenId}
          onClick={() => setIsOpen(open => !open)}
        >
          {content}
        </button>
      );
    }

    if (to) {
      return <Link to={to} className={rowClassName}>{content}</Link>;
    }

    if (href) {
      return <a href={href} className={rowClassName}>{content}</a>;
    }

    return <span className={`${rowClassName} dashboard-attention__row--plain`}>{content}</span>;
  };

  return (
    <li className="dashboard-attention__item">
      {renderRow()}

      {hasChildren && (isGroup || isOpen) && (
        <ul className="dashboard-attention__children list-unstyled mb-0" id={childrenId}>
          {children.map(child => (
            <AttentionRow node={child} level={level + 1} key={child.id} />
          ))}
        </ul>
      )}
    </li>
  );
};

AttentionRow.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    /** Route inside this MFE. */
    to: PropTypes.string,
    /** Absolute URL; `null` when the Sessions MFE base is not configured. */
    href: PropTypes.string,
    /** Renders as a heading with its children always visible. */
    isGroup: PropTypes.bool,
    /** Small label above the title, saying what kind of thing the row names. */
    eyebrow: PropTypes.string,
    /** Top-level rows only. */
    icon: PropTypes.elementType,
    tone: PropTypes.string,
    count: PropTypes.number,
    // Validated one level deep: the shape is recursive, and every level is
    // rendered by this same component.
    children: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      to: PropTypes.string,
      href: PropTypes.string,
    })),
  }).isRequired,
  level: PropTypes.number,
};

AttentionRow.defaultProps = {
  level: 0,
};

export default AttentionRow;
