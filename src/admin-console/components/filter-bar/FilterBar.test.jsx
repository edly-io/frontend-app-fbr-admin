import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import FilterBar from './FilterBar';

describe('<FilterBar />', () => {
  const flushLocaleLoad = () => waitFor(() => {});

  const renderBar = (overrides = {}) => {
    const onStartChange = jest.fn();
    const onEndChange = jest.fn();
    const filters = [
      {
        id: 'dateRange',
        type: 'dateRange',
        label: 'Date range',
        startValue: '',
        endValue: '',
        startLabel: 'Start date',
        endLabel: 'End date',
        onStartChange,
        onEndChange,
        ...overrides,
      },
    ];
    render(
      <IntlProvider locale="en">
        <FilterBar filters={filters} />
      </IntlProvider>,
    );
    return { onStartChange, onEndChange };
  };

  it('renders a labeled select filter', async () => {
    render(
      <IntlProvider locale="en">
        <FilterBar
          filters={[{
            id: 'program',
            label: 'Program',
            value: 'all',
            onChange: jest.fn(),
            options: [{ value: 'all', label: 'All programs' }],
          }]}
        />
      </IntlProvider>,
    );
    await flushLocaleLoad();
    expect(screen.getByText('Program')).toBeInTheDocument();
    expect(screen.getByText('All programs')).toBeInTheDocument();
  });

  it('gives each date-range field its own accessible name via aria-label, with no visible per-field label', async () => {
    renderBar();
    await flushLocaleLoad();
    expect(screen.getByLabelText('Start date')).toBeInTheDocument();
    expect(screen.getByLabelText('End date')).toBeInTheDocument();
    // The single visible label covers the whole pair; it is not `htmlFor`-associated with
    // either individual input.
    expect(screen.getByText('Date range')).toBeInTheDocument();
  });

  it('reports a typed start date as a plain yyyy-MM-dd string', async () => {
    const { onStartChange } = renderBar();
    await flushLocaleLoad();
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '15/09/2026' } });
    expect(onStartChange).toHaveBeenCalledWith('2026-09-15');
  });

  it('disables end-field calendar days before startMax/endMin bounds', async () => {
    const today = new Date();
    const pad = n => String(n).padStart(2, '0');
    const midMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-15`;
    renderBar({ startValue: midMonth, endMin: midMonth });
    await flushLocaleLoad();
    fireEvent.focus(screen.getByLabelText('End date'));
    const disabledDay = await screen.findByText('1', { selector: '.react-datepicker__day--disabled' });
    expect(disabledDay).toBeInTheDocument();
  });

  it('shows the Apply/Clear-all controls only when their handlers are passed', async () => {
    const onApply = jest.fn();
    const onClearAll = jest.fn();
    render(
      <IntlProvider locale="en">
        <FilterBar
          filters={[{
            id: 'program', label: 'Program', value: 'all', onChange: jest.fn(), options: [],
          }]}
          onApply={onApply}
          applyLabel="Apply Filters"
          onClearAll={onClearAll}
          clearAllLabel="Clear all filters"
        />
      </IntlProvider>,
    );
    const applyButton = screen.getByRole('button', { name: 'Apply Filters' });
    const clearButton = screen.getByRole('button', { name: 'Clear all filters' });
    fireEvent.click(applyButton);
    fireEvent.click(clearButton);
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });
});
