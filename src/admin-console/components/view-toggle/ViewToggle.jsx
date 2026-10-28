import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup } from '@openedx/paragon';
import './view-toggle-styles.scss';

const ViewToggle = ({
  views, activeView, onChange, label,
}) => (
  <div className="view-toggle d-flex justify-content-end mb-3">
    <ButtonGroup size="sm" className="view-toggle__group" aria-label={label}>
      {views.map(view => (
        <Button
          key={view.id}
          variant={activeView === view.id ? 'primary' : 'outline-primary'}
          size="sm"
          className="view-toggle__button"
          aria-pressed={activeView === view.id}
          onClick={() => onChange(view.id)}
        >
          {view.label}
        </Button>
      ))}
    </ButtonGroup>
  </div>
);

ViewToggle.propTypes = {
  views: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
  })).isRequired,
  activeView: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default ViewToggle;
