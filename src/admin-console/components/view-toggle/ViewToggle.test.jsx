import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewToggle from './ViewToggle';

const VIEWS = [
  { id: 'list', label: 'Edit Requests' },
  { id: 'audit-log', label: 'Audit Log' },
];

describe('<ViewToggle />', () => {
  it('marks only the active view as pressed inside a labelled group', () => {
    render(<ViewToggle views={VIEWS} activeView="list" onChange={jest.fn()} label="Choose a view" />);

    expect(screen.getByRole('group', { name: 'Choose a view' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Requests' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Audit Log' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports the chosen view', () => {
    const onChange = jest.fn();
    render(<ViewToggle views={VIEWS} activeView="list" onChange={onChange} label="Choose a view" />);

    fireEvent.click(screen.getByRole('button', { name: 'Audit Log' }));

    expect(onChange).toHaveBeenCalledWith('audit-log');
  });
});
