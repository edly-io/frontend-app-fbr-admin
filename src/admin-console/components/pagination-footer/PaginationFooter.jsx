import React from 'react';
import PropTypes from 'prop-types';
import { Form, Pagination } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../messages';
import { ROWS_PER_PAGE_OPTIONS } from '../../constants';
import './pagination-footer-styles.scss';

const renderStrong = chunks => <strong>{chunks}</strong>;

/**
 * Shared pagination footer: a row summary, Paragon's `Pagination` (numbered
 * pages with prev/next, the same control the Users table uses) and the
 * rows-per-page selector.
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
}) => {
  const intl = useIntl();

  return (
    <div className="pagination-footer d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-lg-between">
      <span className="pagination-footer__summary">
        {intl.formatMessage(messages.paginationShowing, {
          start,
          end,
          total,
          strong: renderStrong,
        })}
      </span>
      <Pagination
        paginationLabel={intl.formatMessage(messages.paginationLabel)}
        pageCount={totalPages}
        currentPage={page}
        onPageSelect={onPageChange}
        size="small"
        variant="secondary"
      />
      <div className="pagination-footer__rows-per-page d-flex align-items-center">
        {intl.formatMessage(messages.paginationRowsPerPage)}
        <Form.Control
          as="select"
          size="sm"
          value={rowsPerPage}
          onChange={e => onRowsPerPageChange(Number(e.target.value))}
          className="pagination-footer__rows-select"
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
};

export default PaginationFooter;
