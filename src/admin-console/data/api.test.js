import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { addUserRole, getBulkImportJob, getBulkImportJobs } from './api';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test' }),
}));

jest.mock('@edx/frontend-platform/auth');

describe('addUserRole', () => {
  it('posts to the profile roles endpoint without using assign-role', async () => {
    const post = jest.fn().mockResolvedValue({ data: { id: 42, roles: ['trainee', 'instructor'] } });
    getAuthenticatedHttpClient.mockReturnValue({ post });
    const payload = {
      role: 'instructor',
      instructor: { field_of_expertise: 'Taxation' },
    };

    const result = await addUserRole({ profileId: 42, payload });

    expect(post).toHaveBeenCalledWith(
      'http://lms.test/fbr/api/biodata/v1/users/42/roles/',
      payload,
    );
    expect(result).toEqual({ id: 42, roles: ['trainee', 'instructor'] });
  });
});

describe('bulk import jobs', () => {
  it('loads one job by id', async () => {
    const get = jest.fn().mockResolvedValue({ data: { id: 7, status: 'running' } });
    getAuthenticatedHttpClient.mockReturnValue({ get });

    const job = await getBulkImportJob(7);

    expect(get).toHaveBeenCalledWith('http://lms.test/fbr/api/biodata/v1/users/bulk-import/jobs/7/');
    expect(job).toEqual({ id: 7, status: 'running' });
  });

  it('loads the recent jobs', async () => {
    const get = jest.fn().mockResolvedValue({ data: [{ id: 7 }] });
    getAuthenticatedHttpClient.mockReturnValue({ get });

    const jobs = await getBulkImportJobs();

    expect(get).toHaveBeenCalledWith('http://lms.test/fbr/api/biodata/v1/users/bulk-import/jobs/');
    expect(jobs).toEqual([{ id: 7 }]);
  });
});
