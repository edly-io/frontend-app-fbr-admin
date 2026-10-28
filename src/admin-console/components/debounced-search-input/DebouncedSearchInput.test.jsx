import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import DebouncedSearchInput from './DebouncedSearchInput';

const renderInput = (props = {}) => render(
  <IntlProvider locale="en">
    <DebouncedSearchInput value="" onChange={jest.fn()} {...props} />
  </IntlProvider>,
);

describe('<DebouncedSearchInput />', () => {
  it('uses the placeholder as the accessible name by default', () => {
    renderInput({ placeholder: 'Search by name, email, CNIC…' });

    expect(screen.getByRole('searchbox', { name: 'Search by name, email, CNIC' })).toBeInTheDocument();
  });

  it('prefers an explicit label over the placeholder', () => {
    renderInput({ placeholder: 'Search…', label: 'Search employees' });

    expect(screen.getByRole('searchbox', { name: 'Search employees' })).toBeInTheDocument();
  });

  it('labels the field when no placeholder is passed', () => {
    renderInput();

    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
  });
});
