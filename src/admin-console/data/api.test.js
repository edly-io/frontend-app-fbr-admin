import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { addUserRole } from './api';

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
