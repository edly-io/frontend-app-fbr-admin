import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import { useBulkImportJobs } from '../../data/apiHooks';
import UsersToolbar from './UsersToolbar';

jest.mock('../../data/apiHooks', () => ({
  useBulkImportJobs: jest.fn(),
}));

const onImport = jest.fn();

const renderToolbar = () => render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <UsersToolbar onRecentImports={jest.fn()} onImport={onImport} onAdd={jest.fn()} />
    </MemoryRouter>
  </IntlProvider>,
);

beforeEach(() => onImport.mockReset());

const toolbarButtons = () => screen.getAllByRole('button').map(button => button.textContent.trim());

describe('UsersToolbar', () => {
  it('puts Recent imports to the right of Import', () => {
    useBulkImportJobs.mockReturnValue({ data: [] });

    renderToolbar();

    expect(toolbarButtons()).toEqual(['Import', 'Recent imports', 'Add User']);
  });

  it('shows Importing… and blocks a new import while one is running', () => {
    useBulkImportJobs.mockReturnValue({ data: [{ id: 7, status: 'running' }, { id: 6, status: 'completed' }] });

    renderToolbar();

    const importButton = screen.getByRole('button', { name: /importing…/i });
    fireEvent.click(importButton);
    expect(importButton).toHaveAttribute('aria-disabled', 'true');
    expect(onImport).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Recent imports' })).toBeEnabled();
  });

  it('allows a new import once every import has finished', () => {
    useBulkImportJobs.mockReturnValue({ data: [{ id: 6, status: 'failed' }] });

    renderToolbar();

    fireEvent.click(screen.getByRole('button', { name: 'Import' }));
    expect(onImport).toHaveBeenCalled();
  });
});
