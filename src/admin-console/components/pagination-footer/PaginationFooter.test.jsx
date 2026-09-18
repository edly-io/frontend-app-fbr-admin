import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import PaginationFooter from './PaginationFooter';

const onPageChange = jest.fn();
const onRowsPerPageChange = jest.fn();

const renderFooter = (props = {}) => render(
  <IntlProvider locale="en">
    <PaginationFooter
      page={1}
      totalPages={2}
      start={1}
      end={5}
      total={7}
      rowsPerPage={5}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      {...props}
    />
  </IntlProvider>,
);

afterEach(() => jest.clearAllMocks());

describe('PaginationFooter', () => {
  it('offers one page button per page and no more', () => {
    renderFooter();

    expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Page 3' })).toBeNull();
  });

  it('reports the page the user picks', () => {
    renderFooter();

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('shows the row range and total', () => {
    const { container } = renderFooter();

    expect(container.querySelector('.pagination-footer__summary'))
      .toHaveTextContent('Showing 1–5 of 7');
  });

  it('reports a new rows-per-page choice as a number', () => {
    renderFooter();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '10' } });

    expect(onRowsPerPageChange).toHaveBeenCalledWith(10);
  });
});
