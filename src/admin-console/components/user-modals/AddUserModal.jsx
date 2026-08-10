import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Form } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faHome, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useAdminConsoleBootstrap, useCreateUserMutation, useAssignUserRoleMutation } from '../../data/apiHooks';
import { ROLE_LABELS } from '../../pages/users/constants';
import {
  ROLE_OPTIONS,
  TRAINEE_TYPES,
  ADMIN_ROLES,
  getCreateFieldsForRole,
  toCreatePayload,
  toAssignPayload,
  getFieldInputValue,
  getFieldInputMaxLength,
  getRowKey,
  normalizeFieldInputValue,
  normalizeValue,
  getPakistanMobileSubscriber,
  isValidPakistanMobile,
  getSubmissionErrorState,
} from './addUserModalFields';
import messages from '../messages';
import './user-modals-styles.scss';

const DEFAULT_BOOTSTRAP = {
  callerProfile: { roles: [], city: null, creatable_roles: ['instructor', 'trainee'] },
  cities: [],
  batches: [],
};

const messageDescriptorPropType = PropTypes.shape({
  id: PropTypes.string,
  defaultMessage: PropTypes.string,
  description: PropTypes.string,
});

const getRoleContextText = (intl, role, traineeType, isCityLocked) => {
  if (role === 'trainee') {
    return traineeType === 'stp'
      ? intl.formatMessage(messages.contextTraineeStp)
      : intl.formatMessage(messages.contextTraineeDstIst);
  }
  if (role === 'instructor') { return intl.formatMessage(messages.contextInstructor); }
  if (role === 'data_admin' && isCityLocked) { return intl.formatMessage(messages.contextDataAdminCityLocked); }
  return intl.formatMessage(messages.contextGenericAccount, {
    role: ROLE_LABELS[role] || intl.formatMessage(messages.roleFallbackUser),
  });
};

const FieldRow = ({
  fields, values, onChange, errors, cities, batches,
}) => {
  const intl = useIntl();

  return (
    <div className="add-user-modal__field-row">
      {fields.map((field) => {
        const err = errors[field.id];
        const label = intl.formatMessage(field.labelMessage);
        const placeholder = field.placeholderMessage ? intl.formatMessage(field.placeholderMessage) : undefined;
        let input;

        if (field.type === 'select' && field.id === 'city') {
          input = (
            <Form.Control id={field.id} as="select" value={values[field.id] || ''} onChange={e => onChange(field.id, e.target.value)} isInvalid={!!err}>
              <option value="">{placeholder}</option>
              {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
            </Form.Control>
          );
        } else if (field.type === 'select' && field.id === 'batch') {
          input = (
            <Form.Control id={field.id} as="select" value={values[field.id] || ''} onChange={e => onChange(field.id, e.target.value)} isInvalid={!!err}>
              <option value="">{placeholder}</option>
              {batches.map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
            </Form.Control>
          );
        } else if (field.type === 'textarea') {
          input = (
            <Form.Control
              id={field.id}
              as="textarea"
              value={values[field.id] || ''}
              onChange={e => onChange(field.id, e.target.value)}
              placeholder={placeholder}
              rows={3}
              isInvalid={!!err}
              className="add-user-modal__textarea"
            />
          );
        } else {
          const isCnicField = field.id === 'cnic';
          const isMobileField = field.id === 'mobile' || field.id === 'emergencyContactPhone';
          input = (
            <Form.Control
              id={field.id}
              type={isCnicField || isMobileField ? 'text' : field.type}
              value={getFieldInputValue(field, values[field.id])}
              onChange={e => onChange(field.id, normalizeFieldInputValue(field, e.target.value))}
              placeholder={placeholder}
              inputMode={isCnicField || isMobileField ? 'numeric' : undefined}
              maxLength={getFieldInputMaxLength(field)}
              isInvalid={!!err}
            />
          );
        }

        return (
          <Form.Group
            key={field.id}
            data-field-id={field.id}
            className={`add-user-modal__field-group ${field.full ? 'add-user-modal__field-group--full' : ''}`}
          >
            <Form.Label className="x-small font-weight-bold text-uppercase add-user-modal__field-label">
              {label}
              {field.required && <span className="add-user-modal__required-mark">*</span>}
            </Form.Label>
            {input}
            {field.helperMessage && <Form.Text muted>{intl.formatMessage(field.helperMessage)}</Form.Text>}
            {err && <Form.Control.Feedback type="invalid">{err}</Form.Control.Feedback>}
          </Form.Group>
        );
      })}
    </div>
  );
};

FieldRow.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    labelMessage: messageDescriptorPropType.isRequired,
    type: PropTypes.string.isRequired,
    placeholderMessage: messageDescriptorPropType,
    helperMessage: messageDescriptorPropType,
    required: PropTypes.bool,
    full: PropTypes.bool,
    group: PropTypes.string,
  })).isRequired,
  values: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.objectOf(PropTypes.string).isRequired,
  cities: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  batches: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

const SectionHeader = ({ title, note }) => (
  <div className="add-user-modal__section-header">
    <span className="add-user-modal__section-header-title">
      <FontAwesomeIcon icon={faUserCircle} className="add-user-modal__section-header-icon" />
      {title}
    </span>
    {note && <span className="add-user-modal__section-header-note">{note}</span>}
  </div>
);

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  note: PropTypes.string,
};

SectionHeader.defaultProps = { note: '' };

/**
 * Add User / Assign Role modal, self-contained: loads its own bootstrap data
 * (caller profile, cities, batches, creatable roles) via
 * `useAdminConsoleBootstrap` and submits via `useCreateUserMutation` /
 * `useAssignUserRoleMutation` directly, rather than receiving them as props.
 * This lets both `UsersPage` and `SignupApprovalsPage` mount independent
 * instances of this modal (the monolith rendered a single shared instance).
 *
 * `assignmentUser` (a pending-signup user object) switches the modal into
 * "assignment" mode: role-only, no profile fields.
 */
const AddUserModal = ({ onClose, assignmentUser }) => {
  const intl = useIntl();
  const { data: bootstrapData } = useAdminConsoleBootstrap();
  const { callerProfile, cities, batches } = bootstrapData || DEFAULT_BOOTSTRAP;
  const allowedRoles = callerProfile.creatable_roles;

  const createMutation = useCreateUserMutation();
  const assignMutation = useAssignUserRoleMutation();
  const isSubmitting = createMutation.isPending || assignMutation.isPending;

  const isAssignment = !!assignmentUser;
  const visibleRoles = useMemo(() => ROLE_OPTIONS.filter(role => allowedRoles.includes(role.id)), [allowedRoles]);
  const defaultRole = visibleRoles[0]?.id || 'instructor';
  const initialTraineeType = 'stp';
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [traineeType, setTraineeType] = useState(initialTraineeType);
  const getAssignmentValues = user => ({
    fullName: [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || '',
    email: user?.email || '',
  });
  const [values, setValues] = useState(() => (isAssignment ? getAssignmentValues(assignmentUser) : {}));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const contentRef = useRef(null);
  const apiErrorRef = useRef(null);
  const shouldFocusErrorsRef = useRef(false);

  useEffect(() => {
    setSelectedRole(defaultRole);
  }, [defaultRole]);

  useEffect(() => {
    setTraineeType(initialTraineeType);
    setValues(isAssignment ? getAssignmentValues(assignmentUser) : {});
    setErrors({});
    setApiError('');
    shouldFocusErrorsRef.current = false;
  }, [assignmentUser, initialTraineeType, isAssignment]);

  useEffect(() => {
    if (!isAssignment) {
      setValues({});
      setErrors({});
      setApiError('');
      shouldFocusErrorsRef.current = false;
    }
  }, [isAssignment, selectedRole, traineeType]);

  const isMiddleAdminCaller = callerProfile.roles.includes('middle_admin') && !callerProfile.roles.includes('super_admin');
  const shouldShowCity = ADMIN_ROLES.includes(selectedRole) && selectedRole !== 'super_admin' && !isMiddleAdminCaller;
  const createFields = getCreateFieldsForRole(selectedRole, traineeType, shouldShowCity);
  const contextText = getRoleContextText(intl, selectedRole, traineeType, isMiddleAdminCaller);
  const assignmentEmail = assignmentUser?.email || assignmentUser?.username;
  let submitLabel = intl.formatMessage(messages.createUserButton);
  if (isSubmitting) {
    submitLabel = intl.formatMessage(messages.savingButton);
  } else if (isAssignment) {
    submitLabel = intl.formatMessage(messages.approveUserButton);
  }
  const visibleFieldIds = useMemo(
    () => createFields.flat().map(field => field.id),
    [createFields],
  );

  useEffect(() => {
    if (!shouldFocusErrorsRef.current || !contentRef.current) {
      return;
    }

    const firstErrorFieldId = visibleFieldIds.find(fieldId => errors[fieldId]);
    if (firstErrorFieldId) {
      const fieldGroup = contentRef.current.querySelector(`[data-field-id="${firstErrorFieldId}"]`);
      const fieldInput = fieldGroup?.querySelector('input, select, textarea');

      fieldGroup?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fieldInput?.focus({ preventScroll: true });
      shouldFocusErrorsRef.current = false;
      return;
    }

    if (apiError) {
      apiErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      shouldFocusErrorsRef.current = false;
      return;
    }

    shouldFocusErrorsRef.current = false;
  }, [apiError, errors, visibleFieldIds]);

  const handleChange = (id, val) => {
    setValues(prev => ({ ...prev, [id]: val }));
    if (errors[id]) { setErrors(prev => ({ ...prev, [id]: null })); }
    if (apiError) { setApiError(''); }
  };

  const validate = () => {
    if (isAssignment) {
      return {};
    }

    const nextErrors = {};
    const fields = createFields.flat();

    fields.forEach((field) => {
      if (field.required && (field.id === 'mobile' || field.id === 'emergencyContactPhone') && !getPakistanMobileSubscriber(values[field.id])) {
        nextErrors[field.id] = intl.formatMessage(messages.fieldRequiredError);
      } else if (field.required && !normalizeValue(values[field.id])) {
        nextErrors[field.id] = intl.formatMessage(messages.fieldRequiredError);
      }
    });
    if (values.cnic && !/^\d{13}$/.test(values.cnic)) {
      nextErrors.cnic = intl.formatMessage(messages.cnicFormatError);
    }
    if (getPakistanMobileSubscriber(values.mobile) && !isValidPakistanMobile(values.mobile)) {
      nextErrors.mobile = intl.formatMessage(messages.mobileFormatError);
    }
    if (
      values.emergencyContactPhone
      && getPakistanMobileSubscriber(values.emergencyContactPhone)
      && !isValidPakistanMobile(values.emergencyContactPhone)
    ) {
      nextErrors.emergencyContactPhone = intl.formatMessage(messages.emergencyPhoneFormatError);
    }
    if (selectedRole === 'trainee' && values.bpsGrade && Number.isNaN(Number(values.bpsGrade))) {
      nextErrors.bpsGrade = intl.formatMessage(messages.bpsGradeNumericError);
    }
    if (selectedRole === 'trainee' && traineeType === 'stp' && batches.length === 0) {
      nextErrors.batch = intl.formatMessage(messages.noBatchesAvailableError);
    }
    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      shouldFocusErrorsRef.current = true;
      setErrors(nextErrors);
      return;
    }

    setApiError('');
    try {
      if (isAssignment) {
        await assignMutation.mutateAsync({
          assignmentUserId: assignmentUser?.id,
          payload: toAssignPayload(selectedRole),
        });
      } else {
        await createMutation.mutateAsync({
          role: selectedRole,
          payload: toCreatePayload(selectedRole, traineeType, values, shouldShowCity),
        });
      }
      onClose();
    } catch (error) {
      const fallbackMessage = intl.formatMessage(
        isAssignment ? messages.unableToApproveUserError : messages.unableToCreateUserError,
      );
      const { fieldErrors, apiError: nextApiError } = getSubmissionErrorState(error, {
        fallbackMessage,
        correctHighlightedFieldsMessage: intl.formatMessage(messages.correctHighlightedFieldsError),
      });

      if (Object.keys(fieldErrors).length > 0) {
        shouldFocusErrorsRef.current = true;
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      }

      if (nextApiError) {
        shouldFocusErrorsRef.current = true;
      }
      setApiError(nextApiError);
    }
  };

  const title = intl.formatMessage(isAssignment ? messages.addUserTitleAssignment : messages.addUserTitleCreate);
  const subtitle = intl.formatMessage(
    isAssignment ? messages.addUserSubtitleAssignment : messages.addUserSubtitleCreate,
  );
  const eyebrow = intl.formatMessage(isAssignment ? messages.addUserEyebrowAssignment : messages.addUserEyebrowCreate);

  return (
    <div
      role="button"
      tabIndex={0}
      className="add-user-modal__overlay"
      onClick={e => { if (e.target === e.currentTarget && !isSubmitting) { onClose(); } }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="add-user-modal__panel">
        <div className="add-user-modal__header">
          <div className="add-user-modal__header-icon">
            +
          </div>
          <div>
            <p className="add-user-modal__eyebrow">
              {eyebrow}
            </p>
            <h2 className="add-user-modal__title">{title}</h2>
            <p className="add-user-modal__subtitle">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="add-user-modal__close-btn"
          >
            x
          </button>
        </div>

        <div ref={contentRef} className="add-user-modal__content">
          <div className="add-user-modal__section">
            <p className="add-user-modal__section-label">
              {intl.formatMessage(messages.roleSectionLabel)} <span className="add-user-modal__required-mark">*</span>
            </p>
            <div className="add-user-modal__role-grid">
              {visibleRoles.map((role) => {
                const active = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`add-user-modal__role-btn ${active ? 'add-user-modal__role-btn--active' : ''}`}
                  >
                    <p
                      className={`add-user-modal__role-btn-title ${active ? 'add-user-modal__role-btn-title--active' : ''}`}
                    >{intl.formatMessage(role.labelMessage)}
                    </p>
                    <p
                      className={`add-user-modal__role-btn-desc ${active ? 'add-user-modal__role-btn-desc--active' : ''}`}
                    >{intl.formatMessage(role.descMessage)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedRole === 'trainee' && (
            <div className="add-user-modal__section">
              <p className="add-user-modal__section-label">
                {intl.formatMessage(messages.traineeTypeSectionLabel)} <span className="add-user-modal__required-mark">*</span>
              </p>
              <div className="add-user-modal__trainee-grid">
                {TRAINEE_TYPES.map((type) => {
                  const active = traineeType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setTraineeType(type.id)}
                      className={`add-user-modal__trainee-btn ${active ? 'add-user-modal__trainee-btn--active' : ''}`}
                    >
                      <p
                        className={`add-user-modal__trainee-btn-title ${active ? 'add-user-modal__trainee-btn-title--active' : ''}`}
                      >{intl.formatMessage(type.labelMessage)}
                      </p>
                      <p
                        className={`add-user-modal__trainee-btn-desc ${active ? 'add-user-modal__trainee-btn-desc--active' : ''}`}
                      >{intl.formatMessage(type.descMessage)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {apiError && (
            <Alert ref={apiErrorRef} variant="danger" className="mb-3">
              {apiError}
            </Alert>
          )}

          {!isAssignment && shouldShowCity && cities.length === 0 && (
            <Alert variant="warning" className="mb-3">
              {intl.formatMessage(messages.noCitiesWarning)}
            </Alert>
          )}

          {!isAssignment && selectedRole === 'trainee' && traineeType === 'stp' && batches.length === 0 && (
            <Alert variant="warning" className="mb-3">
              {intl.formatMessage(messages.noBatchesWarning)}
            </Alert>
          )}

          {isAssignment ? (
            <>
              <SectionHeader
                title={intl.formatMessage(messages.sectionSignInApproval)}
                note={intl.formatMessage(messages.sectionSignInApprovalNote)}
              />
              <div className="add-user-modal__summary-box">
                <p className="add-user-modal__summary-text">
                  {intl.formatMessage(messages.assignmentSummary, { email: <strong key="email">{assignmentEmail}</strong> })}
                </p>
              </div>
            </>
          ) : (
            <>
              <SectionHeader title={intl.formatMessage(messages.sectionInformation)} note={contextText} />
              {createFields.map((row) => (
                <FieldRow
                  key={getRowKey(row)}
                  fields={row}
                  values={values}
                  onChange={handleChange}
                  errors={errors}
                  cities={cities}
                  batches={batches}
                />
              ))}
            </>
          )}

          {!isAssignment && selectedRole === 'trainee' && (
            <div className="add-user-modal__hint">
              <FontAwesomeIcon icon={faHome} />
              <span>{intl.formatMessage(messages.batchHintStpOnly)}</span>
            </div>
          )}
        </div>

        <div className="add-user-modal__footer">
          <Button variant="tertiary" onClick={onClose} disabled={isSubmitting}>{intl.formatMessage(messages.cancelButton)}</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              isSubmitting
              || visibleRoles.length === 0
              || (!isAssignment && shouldShowCity && cities.length === 0)
              || (!isAssignment && selectedRole === 'trainee' && traineeType === 'stp' && batches.length === 0)
            }
          >
            <FontAwesomeIcon icon={faCheck} className="add-user-modal__submit-icon" />
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

AddUserModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  assignmentUser: PropTypes.shape({
    id: PropTypes.number,
    username: PropTypes.string,
    email: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
  }),
};

AddUserModal.defaultProps = {
  assignmentUser: null,
};

export default AddUserModal;
