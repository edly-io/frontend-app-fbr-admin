import React from 'react';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import TraineeProgressSheet from './TraineeProgressSheet';
import { useTraineeProgress } from './data/apiHooks';
import { exportTraineeProgress } from './data/api';
import { downloadBlob } from '../../utils/download';

// Ships as untranspiled ESM, which Jest can't parse out of `node_modules`.
jest.mock('@edly-io/frontend-component-fbr', () => ({ UserIdentity: () => null }));

jest.mock('./data/apiHooks', () => ({ useTraineeProgress: jest.fn() }));
jest.mock('./data/api', () => ({ exportTraineeProgress: jest.fn() }));
jest.mock('../../utils/download', () => ({ downloadBlob: jest.fn() }));

const course = (title) => ({
  courseId: `course-v1:FBR+${title}+2026-A`,
  courseTitle: title,
  grade: { percent: 0, passed: false, available: true },
  progress: {
    percent: 0, complete: 0, total: 58, available: true,
  },
});

const renderSheet = () => render(
  <IntlProvider locale="en">
    <TraineeProgressSheet
      show
      trainee="Adeel Farooq"
      email="trainee01@fbr.test"
      program="Tax Administration Fundamentals"
      traineeId="15"
      programKey="program-v1:FBR+STP+2026-A"
      onClose={jest.fn()}
    />
  </IntlProvider>,
);

const csvButton = () => screen.getByRole('button', { name: /course progress as CSV/i });

beforeEach(() => {
  jest.clearAllMocks();
  useTraineeProgress.mockReturnValue({
    data: { courses: [course('Course 1'), course('Course 2')] },
    isLoading: false,
    isError: false,
  });
  exportTraineeProgress.mockResolvedValue({
    blob: new Blob(['Course\r\n'], { type: 'text/csv' }),
    filename: 'tax-administration-fundamentals-adeel-farooq-progress.csv',
  });
});

describe('Trainee progress CSV export', () => {
  it('asks the backend for the CSV using the panel’s program and trainee', async () => {
    renderSheet();
    fireEvent.click(csvButton());

    await waitFor(() => expect(exportTraineeProgress)
      .toHaveBeenCalledWith('program-v1:FBR+STP+2026-A', '15'));
  });

  it('hands the streamed blob to the browser under the backend’s filename', async () => {
    renderSheet();
    fireEvent.click(csvButton());

    await waitFor(() => expect(downloadBlob).toHaveBeenCalledTimes(1));
    expect(downloadBlob.mock.calls[0][1])
      .toBe('tax-administration-fundamentals-adeel-farooq-progress.csv');
  });

  it('surfaces a failed export instead of failing silently', async () => {
    exportTraineeProgress.mockRejectedValue(new Error('boom'));
    renderSheet();
    fireEvent.click(csvButton());

    expect(await screen.findByText(/something went wrong while exporting/i)).toBeInTheDocument();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it('disables the export while a download is already running', async () => {
    renderSheet();
    fireEvent.click(csvButton());

    expect(csvButton()).toBeDisabled();
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
  });

  it('disables the export while the panel has no courses to export', () => {
    useTraineeProgress.mockReturnValue({ data: { courses: [] }, isLoading: false, isError: false });
    renderSheet();

    expect(csvButton()).toBeDisabled();
    expect(exportTraineeProgress).not.toHaveBeenCalled();
  });
});
