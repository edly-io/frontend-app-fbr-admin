import React from 'react';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';

import {
  useAddRoleBatches,
  useAddRoleCities,
  useAddUserRoleMutation,
} from '../../data/apiHooks';
import AddRoleModal, { buildAddRolePayload } from './AddRoleModal';

jest.mock('../../data/apiHooks', () => ({
  useAddRoleBatches: jest.fn(),
  useAddRoleCities: jest.fn(),
  useAddUserRoleMutation: jest.fn(),
}));

const mutateAsync = jest.fn();
const onCancel = jest.fn();
const onSuccess = jest.fn();
const USER_WITH_CITY = {
  id: 42,
  full_name: 'Adeel Farooq',
  city: { id: 7, name: 'Karachi' },
};

const renderModal = ({
  role = 'instructor',
  user = USER_WITH_CITY,
  callerProfile = { roles: ['data_admin'], city: { id: 3, name: 'Lahore' } },
} = {}) => render(
  <IntlProvider locale="en">
    <AddRoleModal
      user={user}
      role={role}
      callerProfile={callerProfile}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  </IntlProvider>,
);

beforeEach(() => {
  mutateAsync.mockReset();
  onCancel.mockReset();
  onSuccess.mockReset();
  useAddUserRoleMutation.mockReturnValue({ mutateAsync, isPending: false });
  useAddRoleCities.mockReturnValue({ data: [{ id: 2, name: 'Islamabad' }], isLoading: false, isError: false });
  useAddRoleBatches.mockReturnValue({ data: [{ id: 9, name: 'STP 2026' }], isLoading: false, isError: false });
});

describe('AddRoleModal fields', () => {
  it('requires instructor expertise but keeps languages optional', async () => {
    renderModal();

    expect(screen.getByLabelText(/field of expertise/i)).toBeRequired();
    expect(screen.getByLabelText(/languages, awards and publications/i)).not.toBeRequired();

    fireEvent.click(screen.getByRole('button', { name: /^add role$/i }));

    expect(await screen.findByText('This field is required.')).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('requires every mandatory trainee field and the STP batch', async () => {
    renderModal({ role: 'trainee' });

    expect(screen.getByLabelText(/trainee type/i)).toBeRequired();
    expect(screen.getByLabelText(/date of birth/i)).toBeRequired();
    expect(screen.getByLabelText(/designation/i)).toBeRequired();
    expect(screen.getByLabelText(/bps grade/i)).toBeRequired();
    expect(screen.getByLabelText(/batch/i)).toBeRequired();
    expect(screen.getByLabelText(/service history/i)).not.toBeRequired();
    expect(screen.getByLabelText(/hostel preference/i)).not.toBeRequired();

    fireEvent.click(screen.getByRole('button', { name: /^add role$/i }));

    expect(await screen.findAllByText('This field is required.')).toHaveLength(4);
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('enforces a minimum BPS grade of 1', async () => {
    renderModal({ role: 'trainee' });
    fireEvent.change(screen.getByLabelText(/bps grade/i), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /^add role$/i }));

    expect(await screen.findByText('BPS grade must be at least 1.')).toBeInTheDocument();
  });
});

describe('buildAddRolePayload', () => {
  it('sends city only when the target did not already have one', () => {
    const values = { city: '2', fieldOfExpertise: 'Taxation' };

    expect(buildAddRolePayload('instructor', values, true)).toEqual({
      role: 'instructor',
      city: 2,
      instructor: { field_of_expertise: 'Taxation' },
    });
    expect(buildAddRolePayload('instructor', values, false)).not.toHaveProperty('city');
  });

  it('omits batch for a DST / IST trainee', () => {
    const payload = buildAddRolePayload('trainee', {
      traineeType: 'dst_ist',
      dateOfBirth: '1990-01-02',
      designation: 'Officer',
      bpsGrade: '17',
      batch: '9',
    }, false);

    expect(payload.trainee).not.toHaveProperty('batch');
  });
});

describe('AddRoleModal city and batch behavior', () => {
  it('hides city for a target that already has one and loads STP batches for that city', () => {
    renderModal({ role: 'trainee' });

    expect(screen.queryByLabelText(/^city/i)).not.toBeInTheDocument();
    expect(useAddRoleCities).toHaveBeenLastCalledWith({ enabled: false });
    expect(useAddRoleBatches).toHaveBeenLastCalledWith({ cityId: 7, enabled: true });
  });

  it('shows city for a cityless target and reloads batches after selection', () => {
    renderModal({ role: 'trainee', user: { ...USER_WITH_CITY, city: null } });

    const citySelect = screen.getByLabelText(/^city/i);
    expect(citySelect).toBeRequired();
    expect(screen.getByLabelText(/batch/i)).toBeDisabled();

    fireEvent.change(citySelect, { target: { value: '2' } });

    expect(useAddRoleBatches).toHaveBeenLastCalledWith({ cityId: 2, enabled: true });
    expect(screen.getByLabelText(/batch/i)).not.toBeDisabled();
  });

  it('hides city for a Middle Admin and uses the caller city for batches', () => {
    renderModal({
      role: 'trainee',
      user: { ...USER_WITH_CITY, city: null },
      callerProfile: { roles: ['middle_admin'], city: { id: 3, name: 'Lahore' } },
    });

    expect(screen.queryByLabelText(/^city/i)).not.toBeInTheDocument();
    expect(useAddRoleBatches).toHaveBeenLastCalledWith({ cityId: 3, enabled: true });
  });

  it('hides and stops loading batch for DST / IST', () => {
    renderModal({ role: 'trainee' });

    fireEvent.change(screen.getByLabelText(/trainee type/i), { target: { value: 'dst_ist' } });

    expect(screen.queryByLabelText(/batch/i)).not.toBeInTheDocument();
    expect(useAddRoleBatches).toHaveBeenLastCalledWith({ cityId: 7, enabled: false });
  });
});

describe('AddRoleModal API errors', () => {
  it('keeps the form open and renders returned 400 field and role errors', async () => {
    mutateAsync.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          role: ['A user with an admin role cannot also be an instructor or a trainee.'],
          instructor: { field_of_expertise: ['This expertise is not accepted.'] },
        },
      },
    });
    renderModal();
    fireEvent.change(screen.getByLabelText(/field of expertise/i), { target: { value: 'Taxation' } });

    fireEvent.click(screen.getByRole('button', { name: /^add role$/i }));

    expect(await screen.findByText('This expertise is not accepted.')).toBeInTheDocument();
    expect(screen.getByText('A user with an admin role cannot also be an instructor or a trainee.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('keeps the form open and renders a returned 403 detail message', async () => {
    mutateAsync.mockRejectedValueOnce({
      response: { status: 403, data: { detail: 'You cannot manage a person in another city.' } },
    });
    renderModal();
    fireEvent.change(screen.getByLabelText(/field of expertise/i), { target: { value: 'Taxation' } });

    fireEvent.click(screen.getByRole('button', { name: /^add role$/i }));

    expect(await screen.findByText('You cannot manage a person in another city.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('sends only the missing role profile and returns the full 201 response', async () => {
    const profile = { ...USER_WITH_CITY, roles: ['trainee', 'instructor'] };
    mutateAsync.mockResolvedValueOnce(profile);
    renderModal();
    fireEvent.change(screen.getByLabelText(/field of expertise/i), { target: { value: ' Taxation ' } });
    fireEvent.change(screen.getByLabelText(/languages, awards/i), { target: { value: ' Urdu ' } });

    fireEvent.click(screen.getByRole('button', { name: /^add role$/i }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
      profileId: 42,
      payload: {
        role: 'instructor',
        instructor: {
          field_of_expertise: 'Taxation',
          languages_awards_publications: 'Urdu',
        },
      },
    }));
    expect(onSuccess).toHaveBeenCalledWith(profile, 'instructor');
  });
});
