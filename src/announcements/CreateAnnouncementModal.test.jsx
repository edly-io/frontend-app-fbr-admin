import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import messages from './messages';
import { createAnnouncement, sendAnnouncement, previewRecipients } from './api';

// Stub out TinyMCE and its side-effecting imports (they touch browser APIs jsdom doesn't
// implement); the editor is replaced with a plain textarea using the same onEditorChange contract.
jest.mock('tinymce', () => ({}));
jest.mock('tinymce/icons/default', () => ({}));
jest.mock('tinymce/themes/silver', () => ({}));
jest.mock('tinymce/skins/ui/oxide/skin.css', () => ({}));
jest.mock('tinymce/plugins/paste', () => ({}));
jest.mock('tinymce/plugins/link', () => ({}));
jest.mock('tinymce/plugins/image', () => ({}));
jest.mock('tinymce/plugins/lists', () => ({}));
jest.mock('@tinymce/tinymce-react', () => ({
  // eslint-disable-next-line react/prop-types
  Editor: ({ onEditorChange }) => (
    <textarea
      aria-label="Body"
      onChange={(e) => onEditorChange(e.target.value)}
    />
  ),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test', STUDIO_BASE_URL: 'http://studio.test' }),
}));

const mockHttpGet = jest.fn();
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: () => ({
    get: (...args) => mockHttpGet(...args),
  }),
}));

beforeEach(() => {
  mockHttpGet.mockResolvedValue({ data: { results: [] } });
});

jest.mock('./api', () => ({
  createAnnouncement: jest.fn(),
  sendAnnouncement: jest.fn(),
  uploadAttachment: jest.fn(),
  previewRecipients: jest.fn(),
}));

const renderModal = (props = {}) => render(
  <IntlProvider locale="en">
    <CreateAnnouncementModal onClose={jest.fn()} onCreated={jest.fn()} {...props} />
  </IntlProvider>,
);

const flushLocaleLoad = () => waitFor(() => {});

const enableBanner = () => fireEvent.click(screen.getByText('Banner'));

describe('<CreateAnnouncementModal /> banner expiry field', () => {
  beforeEach(() => {
    previewRecipients.mockResolvedValue({ data: { count: 3 } });
  });

  afterEach(() => jest.clearAllMocks());

  it('only shows the banner-expiry datepicker once the Banner channel is enabled', async () => {
    renderModal();
    await flushLocaleLoad();
    expect(screen.queryByTestId('ann-banner-expires')).not.toBeInTheDocument();

    enableBanner();
    expect(screen.getByTestId('ann-banner-expires')).toBeInTheDocument();
  });

  it('disables every day in an entirely-past month (min bound at today)', async () => {
    renderModal();
    await flushLocaleLoad();
    enableBanner();
    fireEvent.focus(screen.getByTestId('ann-banner-expires'));
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    expect(screen.queryByLabelText('Previous month')).not.toBeInTheDocument();
  });

  it('requires the banner expiry date before submitting, and sends it as yyyy-MM-dd once set', async () => {
    createAnnouncement.mockResolvedValue({ data: { id: 'ann-1' } });
    sendAnnouncement.mockResolvedValue({});
    renderModal();
    await flushLocaleLoad();

    fireEvent.change(screen.getByPlaceholderText('Announcement subject'), { target: { value: 'Maintenance' } });
    fireEvent.change(screen.getByLabelText('Body'), { target: { value: '<p>Body</p>' } });
    enableBanner();
    fireEvent.change(screen.getByPlaceholderText(/short summary/i), { target: { value: 'Short summary' } });

    fireEvent.change(screen.getByTestId('ann-banner-expires'), { target: { value: '15/10/2026' } });

    fireEvent.click(screen.getByRole('button', { name: 'Send Announcement' }));

    await waitFor(() => {
      expect(createAnnouncement).toHaveBeenCalledWith(
        expect.objectContaining({ banner_expires_at: '2026-10-15' }),
      );
    });
  });
});

describe('<CreateAnnouncementModal /> active banner limit', () => {
  beforeEach(() => {
    previewRecipients.mockResolvedValue({ data: { count: 3 } });
  });

  afterEach(() => jest.clearAllMocks());

  it('warns that the Banner channel is unavailable once two banners are active', async () => {
    mockHttpGet.mockImplementation((url) => Promise.resolve({
      data: { results: url.includes('active-banners') ? [{ id: 1 }, { id: 2 }] : [] },
    }));
    renderModal();

    expect(await screen.findByText(messages.bannerLimitReached.defaultMessage)).toBeInTheDocument();
  });

  it('does not warn while fewer than two banners are active', async () => {
    renderModal();
    await flushLocaleLoad();

    expect(screen.queryByText(messages.bannerLimitReached.defaultMessage)).not.toBeInTheDocument();
  });
});
