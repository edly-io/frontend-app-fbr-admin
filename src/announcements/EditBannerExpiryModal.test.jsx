import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import EditBannerExpiryModal from './EditBannerExpiryModal';
import { updateAnnouncement } from './api';

jest.mock('./api', () => ({ updateAnnouncement: jest.fn() }));

const item = {
  id: '1', subject: 'Maintenance window', banner_expires_at: '2026-10-01T00:00:00Z', banner_active: true,
};

const renderModal = (props = {}) => render(
  <IntlProvider locale="en">
    <EditBannerExpiryModal item={item} onClose={jest.fn()} onSaved={jest.fn()} {...props} />
  </IntlProvider>,
);

const flushLocaleLoad = () => waitFor(() => {});

describe('<EditBannerExpiryModal />', () => {
  afterEach(() => jest.clearAllMocks());

  it('pre-fills the expiry field, displayed as DD/MM/YYYY', async () => {
    renderModal();
    await flushLocaleLoad();
    expect(screen.getByTestId('eexp-date')).toHaveValue('01/10/2026');
  });

  it('associates the visible label with the datepicker input for screen readers', async () => {
    renderModal();
    await flushLocaleLoad();
    const input = screen.getByLabelText(/Banner Expiry Date/);
    expect(input).toHaveAttribute('id', 'eexp-date');
  });

  it('cannot navigate to any month before today (min bound at today)', async () => {
    renderModal({ item: { ...item, banner_expires_at: undefined } });
    await flushLocaleLoad();
    fireEvent.focus(screen.getByTestId('eexp-date'));
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    expect(screen.queryByLabelText('Previous month')).not.toBeInTheDocument();
  });

  it('updates the announcement with a plain yyyy-MM-dd value on Save', async () => {
    updateAnnouncement.mockResolvedValue({});
    const onSaved = jest.fn();
    renderModal({ onSaved });
    await flushLocaleLoad();
    fireEvent.change(screen.getByTestId('eexp-date'), { target: { value: '15/10/2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(updateAnnouncement).toHaveBeenCalledWith('1', { banner_expires_at: '2026-10-15' });
    });
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('disables Save once the field is cleared back to empty (clear/reset support)', async () => {
    renderModal();
    await flushLocaleLoad();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    fireEvent.change(screen.getByTestId('eexp-date'), { target: { value: '' } });
    expect(screen.getByTestId('eexp-date')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(updateAnnouncement).not.toHaveBeenCalled();
  });
});
