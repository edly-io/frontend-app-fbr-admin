import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Button, Form, ModalDialog, Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import {
  useAddRoleBatches,
  useAddRoleCities,
  useAddUserRoleMutation,
} from '../../data/apiHooks';
import messages from '../messages';

const FIELD_KEY_MAP = {
  city: 'city',
  field_of_expertise: 'fieldOfExpertise',
  languages_awards_publications: 'languagesAwardsPublications',
  trainee_type: 'traineeType',
  date_of_birth: 'dateOfBirth',
  designation: 'designation',
  bps_grade: 'bpsGrade',
  batch: 'batch',
  service_history: 'serviceHistory',
  hostel_preference: 'hostelPreference',
};

const getMessages = value => (
  Array.isArray(value) ? value.map(String) : [String(value)]
);

export const getAddRoleErrorState = (error) => {
  const responseData = error?.response?.data;
  const fieldErrors = {};
  const generalErrors = [];

  const collect = (value, key = '') => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([childKey, childValue]) => collect(childValue, childKey));
      return;
    }

    const errorMessages = getMessages(value);
    const fieldKey = FIELD_KEY_MAP[key];
    if (fieldKey) {
      fieldErrors[fieldKey] = errorMessages.join(' ');
    } else {
      generalErrors.push(...errorMessages);
    }
  };

  if (responseData && typeof responseData === 'object') {
    Object.entries(responseData).forEach(([key, value]) => collect(value, key));
  } else if (responseData) {
    generalErrors.push(String(responseData));
  }

  return { fieldErrors, generalErrors };
};

export const buildAddRolePayload = (role, values, shouldSendCity) => {
  const payload = { role };
  if (shouldSendCity && values.city) {
    payload.city = Number(values.city);
  }

  if (role === 'instructor') {
    payload.instructor = {
      field_of_expertise: values.fieldOfExpertise?.trim(),
    };
    if (values.languagesAwardsPublications?.trim()) {
      payload.instructor.languages_awards_publications = values.languagesAwardsPublications.trim();
    }
  } else {
    payload.trainee = {
      trainee_type: values.traineeType,
      date_of_birth: values.dateOfBirth,
      designation: values.designation?.trim(),
      bps_grade: Number(values.bpsGrade),
    };
    if (values.traineeType === 'stp') {
      payload.trainee.batch = Number(values.batch);
    }
    if (values.serviceHistory?.trim()) {
      payload.trainee.service_history = values.serviceHistory.trim();
    }
    if (values.hostelPreference?.trim()) {
      payload.trainee.hostel_preference = values.hostelPreference.trim();
    }
    if (values.languagesAwardsPublications?.trim()) {
      payload.trainee.languages_awards_publications = values.languagesAwardsPublications.trim();
    }
  }

  return payload;
};

const Field = ({
  id, label, required, error, children,
}) => (
  <Form.Group className="add-role-modal__field" controlId={`add-role-${id}`}>
    <Form.Label>
      {label}
      {required && <span className="add-role-modal__required-mark" aria-hidden="true">*</span>}
    </Form.Label>
    {children}
    {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
  </Form.Group>
);

Field.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Field.defaultProps = {
  required: false,
  error: '',
};

const AddRoleModal = ({
  user, role, callerProfile, onCancel, onSuccess,
}) => {
  const intl = useIntl();
  const [values, setValues] = useState({ traineeType: 'stp' });
  const [errors, setErrors] = useState({});
  const [apiErrors, setApiErrors] = useState([]);
  const isMiddleAdmin = callerProfile.roles?.includes('middle_admin');
  const shouldShowCity = !user.city && !isMiddleAdmin;
  const resolvedCityId = user.city?.id
    || (isMiddleAdmin ? callerProfile.city?.id : Number(values.city) || null);
  const needsBatch = role === 'trainee' && values.traineeType === 'stp';

  const citiesQuery = useAddRoleCities({ enabled: shouldShowCity });
  const batchesQuery = useAddRoleBatches({
    cityId: resolvedCityId,
    enabled: needsBatch,
  });
  const mutation = useAddUserRoleMutation();

  const cities = Array.isArray(citiesQuery.data) ? citiesQuery.data : [];
  const batches = Array.isArray(batchesQuery.data) ? batchesQuery.data : [];
  const title = intl.formatMessage(
    role === 'instructor' ? messages.addInstructorRoleTitle : messages.addTraineeRoleTitle,
  );

  const requiredFields = useMemo(() => {
    if (role === 'instructor') {
      return ['fieldOfExpertise', ...(shouldShowCity ? ['city'] : [])];
    }
    return [
      'traineeType', 'dateOfBirth', 'designation', 'bpsGrade',
      ...(shouldShowCity ? ['city'] : []),
      ...(needsBatch ? ['batch'] : []),
    ];
  }, [needsBatch, role, shouldShowCity]);

  const handleChange = (field, value) => {
    setValues(previous => ({
      ...previous,
      [field]: value,
      ...(field === 'city' || (field === 'traineeType' && value !== 'stp') ? { batch: '' } : {}),
    }));
    setErrors(previous => ({ ...previous, [field]: '' }));
    setApiErrors([]);
  };

  const validate = () => {
    const nextErrors = {};
    requiredFields.forEach((field) => {
      if (values[field] === undefined || values[field] === null || String(values[field]).trim() === '') {
        nextErrors[field] = intl.formatMessage(messages.addRoleRequiredError);
      }
    });
    if (values.bpsGrade && Number(values.bpsGrade) < 1) {
      nextErrors.bpsGrade = intl.formatMessage(messages.addRoleBpsGradeError);
    }
    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      const profile = await mutation.mutateAsync({
        profileId: user.id,
        payload: buildAddRolePayload(role, values, shouldShowCity),
      });
      onSuccess(profile, role);
    } catch (error) {
      const errorState = getAddRoleErrorState(error);
      setErrors(previous => ({ ...previous, ...errorState.fieldErrors }));
      setApiErrors(errorState.generalErrors.length
        ? errorState.generalErrors
        : [intl.formatMessage(messages.addRoleFallbackError)]);
    }
  };

  const renderControl = (field, props = {}) => (
    <Form.Control
      {...props}
      value={values[field] || ''}
      onChange={event => handleChange(field, event.target.value)}
      isInvalid={!!errors[field]}
      required={requiredFields.includes(field)}
    />
  );

  return (
    <ModalDialog
      isOpen
      onClose={onCancel}
      title={title}
      size="lg"
      hasCloseButton={!mutation.isPending}
      isFullscreenOnMobile
      className="add-role-modal"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>{title}</ModalDialog.Title>
        <p className="add-role-modal__subtitle">
          {intl.formatMessage(messages.addRoleSubtitle, { name: user.full_name || user.name })}
        </p>
      </ModalDialog.Header>

      <ModalDialog.Body>
        {apiErrors.map(message => (
          <Alert key={message} variant="danger">{message}</Alert>
        ))}

        {shouldShowCity && (
          <Field
            id="city"
            label={intl.formatMessage(messages.addRoleCityLabel)}
            required
            error={errors.city}
          >
            {renderControl('city', {
              as: 'select',
              disabled: citiesQuery.isLoading,
              children: (
                <>
                  <option value="">{intl.formatMessage(messages.addRoleCityPlaceholder)}</option>
                  {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                </>
              ),
            })}
          </Field>
        )}

        {citiesQuery.isLoading && (
          <div className="add-role-modal__loading">
            <Spinner animation="border" size="sm" screenReaderText={intl.formatMessage(messages.addRoleCitiesLoading)} />
            {intl.formatMessage(messages.addRoleCitiesLoading)}
          </div>
        )}
        {citiesQuery.isError && <Alert variant="danger">{intl.formatMessage(messages.addRoleCitiesError)}</Alert>}

        {role === 'instructor' ? (
          <>
            <Field
              id="fieldOfExpertise"
              label={intl.formatMessage(messages.addRoleFieldOfExpertiseLabel)}
              required
              error={errors.fieldOfExpertise}
            >
              {renderControl('fieldOfExpertise', { type: 'text' })}
            </Field>
            <Field
              id="languagesAwardsPublications"
              label={intl.formatMessage(messages.addRoleLanguagesLabel)}
              error={errors.languagesAwardsPublications}
            >
              {renderControl('languagesAwardsPublications', { as: 'textarea', rows: 3 })}
            </Field>
          </>
        ) : (
          <>
            <Field
              id="traineeType"
              label={intl.formatMessage(messages.addRoleTraineeTypeLabel)}
              required
              error={errors.traineeType}
            >
              {renderControl('traineeType', {
                as: 'select',
                children: (
                  <>
                    <option value="stp">{intl.formatMessage(messages.viewUserTraineeTypeStp)}</option>
                    <option value="dst_ist">{intl.formatMessage(messages.viewUserTraineeTypeDstIst)}</option>
                  </>
                ),
              })}
            </Field>
            <div className="add-role-modal__field-row">
              <Field
                id="dateOfBirth"
                label={intl.formatMessage(messages.addRoleDateOfBirthLabel)}
                required
                error={errors.dateOfBirth}
              >
                {renderControl('dateOfBirth', { type: 'date' })}
              </Field>
              <Field
                id="designation"
                label={intl.formatMessage(messages.addRoleDesignationLabel)}
                required
                error={errors.designation}
              >
                {renderControl('designation', { type: 'text' })}
              </Field>
              <Field
                id="bpsGrade"
                label={intl.formatMessage(messages.addRoleBpsGradeLabel)}
                required
                error={errors.bpsGrade}
              >
                {renderControl('bpsGrade', { type: 'number', min: 1 })}
              </Field>
            </div>

            {needsBatch && (
              <Field
                id="batch"
                label={intl.formatMessage(messages.addRoleBatchLabel)}
                required
                error={errors.batch}
              >
                {renderControl('batch', {
                  as: 'select',
                  disabled: !resolvedCityId || batchesQuery.isLoading,
                  children: (
                    <>
                      <option value="">{intl.formatMessage(messages.addRoleBatchPlaceholder)}</option>
                      {batches.map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
                    </>
                  ),
                })}
              </Field>
            )}
            {batchesQuery.isLoading && (
              <div className="add-role-modal__loading">
                <Spinner animation="border" size="sm" screenReaderText={intl.formatMessage(messages.addRoleBatchesLoading)} />
                {intl.formatMessage(messages.addRoleBatchesLoading)}
              </div>
            )}
            {batchesQuery.isError && <Alert variant="danger">{intl.formatMessage(messages.addRoleBatchesError)}</Alert>}

            <Field
              id="serviceHistory"
              label={intl.formatMessage(messages.addRoleServiceHistoryLabel)}
              error={errors.serviceHistory}
            >
              {renderControl('serviceHistory', { as: 'textarea', rows: 3 })}
            </Field>
            <Field
              id="hostelPreference"
              label={intl.formatMessage(messages.addRoleHostelPreferenceLabel)}
              error={errors.hostelPreference}
            >
              {renderControl('hostelPreference', { type: 'text' })}
            </Field>
            <Field
              id="languagesAwardsPublications"
              label={intl.formatMessage(messages.addRoleLanguagesLabel)}
              error={errors.languagesAwardsPublications}
            >
              {renderControl('languagesAwardsPublications', { as: 'textarea', rows: 3 })}
            </Field>
          </>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button variant="tertiary" onClick={onCancel} disabled={mutation.isPending}>
          {intl.formatMessage(messages.addRoleCancelButton)}
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending
            ? intl.formatMessage(messages.addRoleSavingButton)
            : intl.formatMessage(messages.addRoleSubmitButton)}
        </Button>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

AddRoleModal.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    full_name: PropTypes.string,
    name: PropTypes.string,
    city: PropTypes.shape({ id: PropTypes.number }),
  }).isRequired,
  role: PropTypes.oneOf(['instructor', 'trainee']).isRequired,
  callerProfile: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.string),
    city: PropTypes.shape({ id: PropTypes.number }),
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default AddRoleModal;
