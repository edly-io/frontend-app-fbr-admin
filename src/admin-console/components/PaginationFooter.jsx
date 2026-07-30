import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../messages';
import { ROWS_PER_PAGE_OPTIONS } from '../constants';

const renderStrong = chunks => <strong>{chunks}</strong>;

/**
 * Shared pagination footer used by Users, Signup Approvals and Biodata Edit
 * Requests tables/lists. Preserves the exact pagination math and rows-per-page
 * behavior previously duplicated across each view in the monolith.
 *
 * When `showPageNumbers` is true (Users), numbered page buttons are rendered
 * in addition to the prev/next chevrons, matching the original Users table
 * footer. Signup Approvals / Biodata Edit Requests only rendered the chevrons.
 */
const PaginationFooter = ({
  page,
  totalPages,
  start,
  end,
  total,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  showPageNumbers,
}) => {
  const intl = useIntl();

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--pgn-color-gray-100)', background: 'var(--pgn-color-gray-100)',
    }}
    >
      <span style={{ fontSize: '13px', color: 'var(--pgn-color-text-light)' }}>
        {intl.formatMessage(messages.paginationShowing, {
          start,
          end,
          total,
          strong: renderStrong,
        })}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label={intl.formatMessage(messages.paginationPrevious)}
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '10px' }} />
        </Button>
        {showPageNumbers && Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <Button key={n} size="sm" variant={n === page ? 'primary' : 'outline-secondary'} onClick={() => onPageChange(n)}>
            {n}
          </Button>
        ))}
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label={intl.formatMessage(messages.paginationNext)}
        >
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '10px' }} />
        </Button>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--pgn-color-text-light)',
      }}
      >
        {intl.formatMessage(messages.paginationRowsPerPage)}
        <Form.Control
          as="select"
          size="sm"
          value={rowsPerPage}
          onChange={e => onRowsPerPageChange(Number(e.target.value))}
          style={{ width: 'auto' }}
        >
          {ROWS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </Form.Control>
      </div>
    </div>
  );
};

PaginationFooter.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  showPageNumbers: PropTypes.bool,
};

PaginationFooter.defaultProps = {
  showPageNumbers: false,
};

export default PaginationFooter;
