import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Alert, Button, Form, ModalDialog,
} from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faHome } from '@fortawesome/free-solid-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ROLE_LABELS } from '../users/constants';
import { ROLE_OPTIONS, TRAINEE_TYPES } from '../../components/addUserModalFields';
import { useAdminConsoleBootstrap } from '../../data/apiHooks';
import { useAssignHrmsEmployeeRoleMutation } from './data/apiHooks';
import messages from './messages';

const DEFAULT_BOOTSTRAP = {
  callerProfile: { roles: [], city: null, creatable_roles: ['instructor', 'trainee'] },
  cities: [],
  batches: [],
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.join(' ');
  }

  if (Array.isArray(data?.non_field_errors)) {
    return data.non_field_errors.join(' ');
  }

  return data?.detail || fallbackMessage;
};

const toHrmsAssignPayload = ({
  employee,
  role,
  traineeType,
  city,
  batch,
  callerCity,
}) => {
  const payload = {
    paypeople_employee_id: Number(employee.paypeopleEmployeeId),
    role,
  };

  if (['middle_admin', 'data_admin'].includes(role)) {
    payload.city = Number(city || callerCity?.id);
  }

  if (role === 'trainee') {
    payload.trainee_type = traineeType === 'stp' ? 'STP' : 'DST_IST';
    if (traineeType === 'stp') {
      payload.batch = Number(batch);
    }
  }

  return payload;
};

const HrmsAssignRoleModal = ({ employee, onClose, onSuccess }) => {
  const intl = useIntl();
  const { data: bootstrapData } = useAdminConsoleBootstrap();
  const { callerProfile, cities, batches } = bootstrapData || DEFAULT_BOOTSTRAP;
  const allowedRoles = useMemo(() => callerProfile.creatable_roles || [], [callerProfile.creatable_roles]);
  const visibleRoles = useMemo(
    () => ROLE_OPTIONS.filter(role => allowedRoles.includes(role.id)),
    [allowedRoles],
  );
  const defaultRole = visibleRoles[0]?.id || '';
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [traineeType, setTraineeType] = useState('stp');
  const [city, setCity] = useState('');
  const [batch, setBatch] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const assignRoleMutation = useAssignHrmsEmployeeRoleMutation();
  const isSubmitting = assignRoleMutation.isPending;
  const callerRoles = callerProfile.roles || [];
  const isMiddleAdminCaller = callerRoles.includes('middle_admin') && !callerRoles.includes('super_admin');
  const roleNeedsCity = ['middle_admin', 'data_admin'].includes(selectedRole);
  const shouldShowCity = roleNeedsCity && !isMiddleAdminCaller;
  const shouldShowBatch = selectedRole === 'trainee' && traineeType === 'stp';
  const roleLabel = selectedRole ? ROLE_LABELS[selectedRole] || selectedRole : '';
  const assignmentEmail = employee.email || employee.fullName || employee.employeeCode || employee.paypeopleEmployeeId;
  const submitLabel = isSubmitting
    ? intl.formatMessage(messages.savingButton)
    : intl.formatMessage(messages.assignRoleButton);
  const roleSectionId = 'hrms-role-options';
  const traineeTypeSectionId = 'hrms-trainee-type-options';

  useEffect(() => {
    setSelectedRole(defaultRole);
  }, [defaultRole]);

  useEffect(() => {
    setErrors({});
    setApiError('');
  }, [selectedRole, traineeType, city, batch]);

  const validate = () => {
    const nextErrors = {};

    if (!selectedRole) {
      nextErrors.role = intl.formatMessage(messages.fieldRequiredError);
    }

    if (roleNeedsCity && !city && !callerProfile.city?.id) {
      nextErrors.city = intl.formatMessage(messages.fieldRequiredError);
    }

    if (shouldShowBatch && !batch) {
      nextErrors.batch = intl.formatMessage(messages.fieldRequiredError);
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setApiError('');
    try {
      await assignRoleMutation.mutateAsync(toHrmsAssignPayload({
        employee,
        role: selectedRole,
        traineeType,
        city,
        batch,
        callerCity: callerProfile.city,
      }));
      onSuccess();
    } catch (error) {
      setApiError(getApiErrorMessage(error, intl.formatMessage(messages.assignRoleError)));
    }
  };

  return (
    <ModalDialog
      title={intl.formatMessage(messages.assignRoleTitle)}
      isOpen
      onClose={onClose}
      size="lg"
      className="hrms-assign-modal"
      hasCloseButton
      isFullscreenOnMobile
    >
      <ModalDialog.Header className="hrms-assign-modal__header">
        <div className="hrms-assign-modal__header-icon">+</div>
        <div>
          <p className="hrms-assign-modal__eyebrow">
            {intl.formatMessage(messages.assignRoleEyebrow)}
          </p>
          <ModalDialog.Title className="hrms-assign-modal__title">
            {intl.formatMessage(messages.assignRoleTitle)}
          </ModalDialog.Title>
          <p className="hrms-assign-modal__header-subtitle">
            {intl.formatMessage(messages.assignRoleSubtitle)}
          </p>
        </div>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <div className="hrms-assign-modal__summary">
          <p>
            {intl.formatMessage(messages.assignmentSummary, {
              email: <strong key="email">{assignmentEmail}</strong>,
            })}
          </p>
        </div>

        {apiError && <Alert variant="danger">{apiError}</Alert>}
        {visibleRoles.length === 0 && (
          <Alert variant="warning">{intl.formatMessage(messages.noRolesError)}</Alert>
        )}
        {shouldShowCity && cities.length === 0 && (
          <Alert variant="warning">{intl.formatMessage(messages.noCitiesError)}</Alert>
        )}
        {shouldShowBatch && batches.length === 0 && (
          <Alert variant="warning">{intl.formatMessage(messages.noBatchesError)}</Alert>
        )}

        <Form>
          <Form.Group controlId={roleSectionId} className="hrms-assign-modal__field-group">
            <Form.Label className="hrms-assign-modal__section-label">
              {intl.formatMessage(messages.roleLabel)}
              <span className="hrms-assign-modal__required">*</span>
            </Form.Label>
            <div
              id={roleSectionId}
              className="hrms-assign-modal__option-grid"
              role="radiogroup"
              aria-label={intl.formatMessage(messages.roleLabel)}
            >
              {visibleRoles.map(role => (
                <Button
                  key={role.id}
                  type="button"
                  variant="outline-primary"
                  className={`hrms-assign-modal__option-card ${
                    selectedRole === role.id ? 'hrms-assign-modal__option-card--active' : ''
                  }`}
                  aria-pressed={selectedRole === role.id}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <span className="hrms-assign-modal__option-title">
                    {intl.formatMessage(role.labelMessage)}
                  </span>
                  <span className="hrms-assign-modal__option-description">
                    {intl.formatMessage(role.descMessage)}
                  </span>
                </Button>
              ))}
            </div>
            {errors.role && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors.role}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {selectedRole === 'trainee' && (
            <Form.Group controlId={traineeTypeSectionId} className="hrms-assign-modal__field-group">
              <Form.Label className="hrms-assign-modal__section-label">
                {intl.formatMessage(messages.traineeTypeLabel)}
                <span className="hrms-assign-modal__required">*</span>
              </Form.Label>
              <div
                id={traineeTypeSectionId}
                className="hrms-assign-modal__trainee-grid"
                role="radiogroup"
                aria-label={intl.formatMessage(messages.traineeTypeLabel)}
              >
                {TRAINEE_TYPES.map(type => (
                  <Button
                    key={type.id}
                    type="button"
                    variant="outline-primary"
                    className={`hrms-assign-modal__option-card ${
                      traineeType === type.id ? 'hrms-assign-modal__option-card--active' : ''
                    }`}
                    aria-pressed={traineeType === type.id}
                    onClick={() => setTraineeType(type.id)}
                  >
                    <span className="hrms-assign-modal__option-title">
                      {type.id === 'stp'
                        ? intl.formatMessage(messages.traineeTypeStp)
                        : intl.formatMessage(messages.traineeTypeDstIst)}
                    </span>
                    <span className="hrms-assign-modal__option-description">
                      {intl.formatMessage(type.descMessage)}
                    </span>
                  </Button>
                ))}
              </div>
            </Form.Group>
          )}

          {shouldShowCity && (
            <Form.Group controlId="hrms-city">
              <Form.Label>{intl.formatMessage(messages.cityLabel)}</Form.Label>
              <Form.Control
                as="select"
                value={city}
                onChange={event => setCity(event.target.value)}
                isInvalid={!!errors.city}
              >
                <option value="">{intl.formatMessage(messages.cityPlaceholder)}</option>
                {cities.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </Form.Control>
              {errors.city && <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>}
            </Form.Group>
          )}

          {roleNeedsCity && isMiddleAdminCaller && (
            <Form.Text className="d-block mb-3">
              {intl.formatMessage(messages.cityLockedNote)}
            </Form.Text>
          )}

          {shouldShowBatch && (
            <Form.Group controlId="hrms-batch">
              <Form.Label>{intl.formatMessage(messages.batchLabel)}</Form.Label>
              <Form.Control
                as="select"
                value={batch}
                onChange={event => setBatch(event.target.value)}
                isInvalid={!!errors.batch}
              >
                <option value="">{intl.formatMessage(messages.batchPlaceholder)}</option>
                {batches.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </Form.Control>
              {errors.batch && <Form.Control.Feedback type="invalid">{errors.batch}</Form.Control.Feedback>}
            </Form.Group>
          )}
        </Form>

        {selectedRole === 'trainee' && (
          <p className="hrms-modal__role-summary hrms-modal__role-summary--hint">
            <FontAwesomeIcon icon={faHome} />
            {intl.formatMessage(messages.batchHintStpOnly)}
          </p>
        )}

        {roleLabel && (
          <p className="hrms-modal__role-summary">
            {roleLabel}
          </p>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="tertiary" onClick={onClose} disabled={isSubmitting}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              isSubmitting
              || visibleRoles.length === 0
              || (shouldShowCity && cities.length === 0)
              || (shouldShowBatch && batches.length === 0)
            }
          >
            <FontAwesomeIcon icon={faCheck} className="mr-2" />
            {submitLabel}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

HrmsAssignRoleModal.propTypes = {
  employee: PropTypes.shape({
    paypeopleEmployeeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    employeeCode: PropTypes.string,
    fullName: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default HrmsAssignRoleModal;
