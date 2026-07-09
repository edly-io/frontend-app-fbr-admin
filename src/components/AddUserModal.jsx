import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faHome, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const ROLE_OPTIONS = [
  { id: 'super_admin', label: 'Super Admin', desc: 'Platform-wide' },
  { id: 'middle_admin', label: 'Middle Admin', desc: 'City scope' },
  { id: 'data_admin', label: 'Data Admin', desc: 'Operations' },
  { id: 'instructor', label: 'Instructor', desc: 'Trainer' },
  { id: 'trainee', label: 'Trainee', desc: 'Learner' },
];

const TRAINEE_TYPES = [
  { id: 'stp', label: 'STP', desc: 'Specialised training programme' },
  { id: 'dst_ist', label: 'DST / IST', desc: 'Domain / in-service training' },
];

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  middle_admin: 'Middle Admin',
  data_admin: 'Data Admin',
  instructor: 'Instructor',
  trainee: 'Trainee',
};

const F = {
  fullName: {
    id: 'fullName', key: 'full_name', label: 'FULL NAME', type: 'text', placeholder: 'e.g. Asma Khan', required: true, full: true, group: 'base',
  },
  email: {
    id: 'email', key: 'email', label: 'EMAIL', type: 'email', placeholder: 'name@fbr.gov.pk', required: true, group: 'base',
  },
  cnic: {
    id: 'cnic', key: 'cnic', label: 'CNIC', type: 'text', placeholder: '13 digits without dashes', helper: 'Use 13 digits, no dashes.', group: 'base',
  },
  mobile: {
    id: 'mobile', key: 'mobile', label: 'MOBILE', type: 'tel', placeholder: '+92 3XX XXXXXXX', required: true, group: 'base',
  },
  fieldOrganisation: {
    id: 'fieldOrganisation', key: 'field_organisation', label: 'FIELD ORGANISATION', type: 'text', placeholder: 'e.g. RTO Lahore / FBR Training Academy', required: true, full: true, group: 'base',
  },
  city: {
    id: 'city', key: 'city', label: 'CITY', type: 'select', placeholder: 'Select city...', required: true, group: 'base',
  },
  emergencyContactName: {
    id: 'emergencyContactName', key: 'emergency_contact_name', label: 'EMERGENCY CONTACT NAME', type: 'text', group: 'base',
  },
  emergencyContactPhone: {
    id: 'emergencyContactPhone', key: 'emergency_contact_phone', label: 'EMERGENCY CONTACT PHONE', type: 'tel', group: 'base',
  },
  educationDegree: {
    id: 'educationDegree', key: 'education_degree', label: 'EDUCATION DEGREE', type: 'text', group: 'base',
  },
  educationInstitute: {
    id: 'educationInstitute', key: 'education_institute', label: 'EDUCATION INSTITUTE', type: 'text', group: 'base',
  },
  educationYear: {
    id: 'educationYear', key: 'education_year', label: 'EDUCATION YEAR', type: 'number', group: 'base',
  },
  fieldOfExpertise: {
    id: 'fieldOfExpertise', key: 'field_of_expertise', label: 'FIELD OF EXPERTISE', type: 'text', placeholder: 'e.g. Inland Revenue', required: true, full: true, group: 'instructor_profile',
  },
  dateOfBirth: {
    id: 'dateOfBirth', key: 'date_of_birth', label: 'DATE OF BIRTH', type: 'date', required: true, group: 'trainee_profile',
  },
  designation: {
    id: 'designation', key: 'designation', label: 'DESIGNATION', type: 'text', placeholder: 'e.g. Assistant Commissioner IR', required: true, group: 'trainee_profile',
  },
  bpsGrade: {
    id: 'bpsGrade', key: 'bps_grade', label: 'BPS GRADE', type: 'number', placeholder: '17', required: true, group: 'trainee_profile',
  },
  batch: {
    id: 'batch', key: 'batch', label: 'BATCH', type: 'select', placeholder: 'Select batch...', group: 'trainee_profile',
  },
  serviceHistory: {
    id: 'serviceHistory', key: 'service_history', label: 'SERVICE HISTORY', type: 'textarea', placeholder: 'Previous postings, if available', group: 'trainee_profile',
  },
  hostelPreference: {
    id: 'hostelPreference', key: 'hostel_preference', label: 'HOSTEL PREFERENCE', type: 'text', placeholder: 'Hostel Required / Own Accommodation', group: 'trainee_profile',
  },
  languagesAwardsPublications: {
    id: 'languagesAwardsPublications', key: 'languages_awards_publications', label: 'LANGUAGES, AWARDS, PUBLICATIONS', type: 'textarea', full: true,
  },
};

const ADMIN_ROLES = ['super_admin', 'middle_admin', 'data_admin'];
const NUMBER_KEYS = ['bps_grade', 'city', 'batch', 'education_year'];
const FIELD_ID_BY_API_KEY = Object.values(F).reduce((acc, field) => {
  acc[field.key] = field.id;
  return acc;
}, {});

const normalizeValue = value => (typeof value === 'string' ? value.trim() : value);

const sanitizeCnicValue = value => String(value || '').replace(/\D/g, '').slice(0, 13);

const getPakistanMobileSubscriber = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('92')) { digits = digits.slice(2); }
  if (digits.startsWith('0')) { digits = digits.slice(1); }
  if (digits && digits[0] !== '3') { digits = ''; }
  return digits.slice(0, 10);
};

const formatPakistanMobileValue = value => `+92${getPakistanMobileSubscriber(value)}`;

const normalizeFieldInputValue = (field, value) => {
  if (field.id === 'cnic') { return sanitizeCnicValue(value); }
  if (field.id === 'mobile' || field.id === 'emergencyContactPhone') { return formatPakistanMobileValue(value); }
  return value;
};

const normalizePayloadFieldValue = (field, value) => {
  if (field.id === 'cnic') { return sanitizeCnicValue(value); }
  if (field.id === 'mobile' || field.id === 'emergencyContactPhone') {
    const subscriber = getPakistanMobileSubscriber(value);
    return subscriber ? `+92${subscriber}` : '';
  }
  return normalizeValue(value);
};

const isValidPakistanMobile = value => /^3\d{9}$/.test(getPakistanMobileSubscriber(value));

const toErrorMessage = (value) => {
  if (Array.isArray(value)) { return value.join(' '); }
  if (typeof value === 'string') { return value; }
  return '';
};

const getSubmissionErrorState = (error, fallbackMessage) => {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (!data || typeof data === 'string' || Array.isArray(data)) {
    return {
      fieldErrors: {},
      apiError: toErrorMessage(data) || fallbackMessage,
    };
  }

  const fieldErrors = Object.entries(data).reduce((acc, [key, value]) => {
    const fieldId = FIELD_ID_BY_API_KEY[key];
    const message = toErrorMessage(value);

    if (fieldId && message) {
      acc[fieldId] = message;
    }

    return acc;
  }, {});

  if (status === 400 && Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      apiError: 'Please correct the highlighted fields.',
    };
  }

  return {
    fieldErrors: {},
    apiError: toErrorMessage(data.detail)
      || toErrorMessage(data.non_field_errors)
      || fallbackMessage,
  };
};

const getCreateFieldsForRole = (role, traineeType, shouldShowCity) => {
  if (ADMIN_ROLES.includes(role)) {
    return [
      [F.fullName],
      [F.email, { ...F.cnic, required: true }],
      [{ ...F.mobile, required: false }],
      [F.fieldOrganisation],
      ...(shouldShowCity ? [[F.city]] : []),
    ];
  }

  if (role === 'instructor') {
    return [
      [F.fullName],
      [F.email, F.mobile],
      [F.cnic],
      [F.fieldOfExpertise],
      [F.fieldOrganisation],
      [{ ...F.languagesAwardsPublications, group: 'instructor_profile' }],
    ];
  }

  return [
    [F.fullName],
    [F.email, F.mobile],
    [F.cnic, F.dateOfBirth],
    [F.designation, F.bpsGrade],
    [F.fieldOrganisation],
    ...(traineeType === 'stp' ? [[{ ...F.batch, required: true }, F.hostelPreference]] : [[F.hostelPreference]]),
    [F.serviceHistory],
    [{ ...F.languagesAwardsPublications, group: 'trainee_profile' }],
  ];
};

const getRoleContext = (role, traineeType, isCityLocked) => {
  if (role === 'trainee') { return traineeType === 'stp' ? 'STP trainee account' : 'DST / IST trainee account'; }
  if (role === 'instructor') { return 'Instructor account'; }
  if (role === 'data_admin' && isCityLocked) { return 'Data Admin city will be locked to your city'; }
  return `${ROLE_LABELS[role] || 'User'} account`;
};
const toCreatePayload = (role, traineeType, values, shouldSendCity) => {
  const fields = getCreateFieldsForRole(role, traineeType, shouldSendCity).flat();
  const payload = {};

  fields.forEach((field) => {
    const value = normalizePayloadFieldValue(field, values[field.id]);
    if (value !== undefined && value !== null && value !== '') {
      payload[field.key] = NUMBER_KEYS.includes(field.key) ? Number(value) : value;
    }
  });

  if (ADMIN_ROLES.includes(role)) { payload.role = role; }
  if (role === 'trainee') { payload.trainee_type = traineeType; }
  return payload;
};

const toAssignPayload = role => ({ role });

const getFieldInputValue = (field, value) => {
  if (field.id === 'mobile' || field.id === 'emergencyContactPhone') {
    return formatPakistanMobileValue(value);
  }

  if (field.id === 'cnic') {
    return sanitizeCnicValue(value);
  }

  return value || '';
};

const getFieldInputMaxLength = (field) => {
  if (field.id === 'cnic') {
    return 13;
  }

  if (field.id === 'mobile' || field.id === 'emergencyContactPhone') {
    return 13;
  }

  return undefined;
};

const getRowKey = row => row.map(field => field.id).join('-');

const FieldRow = ({
  fields, values, onChange, errors, cities, batches,
}) => (
  <div style={{
    display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap',
  }}
  >
    {fields.map((field) => {
      const err = errors[field.id];
      let input;

      if (field.type === 'select' && field.id === 'city') {
        input = (
          <Form.Control id={field.id} as="select" value={values[field.id] || ''} onChange={e => onChange(field.id, e.target.value)} isInvalid={!!err}>
            <option value="">{field.placeholder}</option>
            {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
          </Form.Control>
        );
      } else if (field.type === 'select' && field.id === 'batch') {
        input = (
          <Form.Control id={field.id} as="select" value={values[field.id] || ''} onChange={e => onChange(field.id, e.target.value)} isInvalid={!!err}>
            <option value="">{field.placeholder}</option>
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
            placeholder={field.placeholder}
            rows={3}
            isInvalid={!!err}
            style={{ resize: 'vertical', minHeight: '80px' }}
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
            placeholder={field.placeholder}
            inputMode={isCnicField || isMobileField ? 'numeric' : undefined}
            maxLength={getFieldInputMaxLength(field)}
            isInvalid={!!err}
          />
        );
      }

      return (
        <Form.Group key={field.id} data-field-id={field.id} style={{ flex: field.full ? '0 0 100%' : '1 1 260px', minWidth: 0, marginBottom: 0 }}>
          <Form.Label className="x-small font-weight-bold text-uppercase" style={{ letterSpacing: '0.07em' }}>
            {field.label}
            {field.required && <span style={{ color: '#E53E3E', marginLeft: '3px' }}>*</span>}
          </Form.Label>
          {input}
          {field.helper && <Form.Text muted>{field.helper}</Form.Text>}
          {err && <Form.Control.Feedback type="invalid">{err}</Form.Control.Feedback>}
        </Form.Group>
      );
    })}
  </div>
);

FieldRow.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    helper: PropTypes.string,
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
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 16px', borderTop: '1px solid var(--pgn-color-border)', paddingTop: '18px',
  }}
  >
    <span style={{
      fontSize: '11.5px', fontWeight: 700, color: '#2A6496', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px',
    }}
    >
      <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: '12px' }} />
      {title}
    </span>
    {note && <span style={{ fontSize: '12px', color: 'var(--pgn-color-text-light)' }}>{note}</span>}
  </div>
);

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  note: PropTypes.string,
};

SectionHeader.defaultProps = { note: '' };

const AddUserModal = ({
  onClose,
  onSubmit,
  allowedRoles,
  callerProfile,
  cities,
  batches,
  assignmentUser,
}) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const contextText = getRoleContext(selectedRole, traineeType, isMiddleAdminCaller);
  const assignmentEmail = assignmentUser?.email || assignmentUser?.username;
  let submitLabel = 'Create User';
  if (isSubmitting) {
    submitLabel = 'Saving...';
  } else if (isAssignment) {
    submitLabel = 'Approve User';
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
        nextErrors[field.id] = 'This field is required';
      } else if (field.required && !normalizeValue(values[field.id])) {
        nextErrors[field.id] = 'This field is required';
      }
    });
    if (values.cnic && !/^\d{13}$/.test(values.cnic)) {
      nextErrors.cnic = 'CNIC must be 13 digits without dashes';
    }
    if (getPakistanMobileSubscriber(values.mobile) && !isValidPakistanMobile(values.mobile)) {
      nextErrors.mobile = 'Mobile must start with 3 and contain 10 digits after +92';
    }
    if (
      values.emergencyContactPhone
      && getPakistanMobileSubscriber(values.emergencyContactPhone)
      && !isValidPakistanMobile(values.emergencyContactPhone)
    ) {
      nextErrors.emergencyContactPhone = 'Emergency phone must start with 3 and contain 10 digits after +92';
    }
    if (selectedRole === 'trainee' && values.bpsGrade && Number.isNaN(Number(values.bpsGrade))) {
      nextErrors.bpsGrade = 'Enter a numeric grade';
    }
    if (selectedRole === 'trainee' && traineeType === 'stp' && batches.length === 0) {
      nextErrors.batch = 'No batches are available yet';
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

    setIsSubmitting(true);
    setApiError('');
    try {
      await onSubmit({
        assignmentUserId: assignmentUser?.id,
        role: selectedRole,
        payload: isAssignment
          ? toAssignPayload(selectedRole)
          : toCreatePayload(selectedRole, traineeType, values, shouldShowCity),
      });
      onClose();
    } catch (error) {
      const fallbackMessage = `Unable to ${isAssignment ? 'approve' : 'create'} user.`;
      const { fieldErrors, apiError: nextApiError } = getSubmissionErrorState(error, fallbackMessage);

      if (Object.keys(fieldErrors).length > 0) {
        shouldFocusErrorsRef.current = true;
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      }

      if (nextApiError) {
        shouldFocusErrorsRef.current = true;
      }
      setApiError(nextApiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = isAssignment ? 'Approve Sign-in' : 'Add User';
  const subtitle = isAssignment ? 'Create an FBR profile and assign access' : 'Create a new account and send credentials by WhatsApp';

  return (
    <div
      role="button"
      tabIndex={0}
      style={{
        position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget && !isSubmitting) { onClose(); } }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '12px', width: '880px', maxWidth: '96vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
      }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #1E4976 100%)', padding: '22px 28px', borderBottom: '3px solid #C9922A', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '16px', position: 'relative',
        }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '20px', flexShrink: 0,
          }}
          >
            +
          </div>
          <div>
            <p style={{
              margin: 0, fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}
            >
              {isAssignment ? 'SIGN-IN APPROVAL' : 'NEW RECORD'}
            </p>
            <h2 style={{
              margin: '2px 0 0', fontSize: '20px', fontWeight: 700, color: '#fff',
            }}
            >{title}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              position: 'absolute', top: '18px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', color: '#fff', width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            x
          </button>
        </div>

        <div ref={contentRef} style={{ overflowY: 'auto', flex: 1, padding: '24px 28px' }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{
              fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-text-light)', letterSpacing: '0.07em', display: 'block', marginBottom: '8px',
            }}
            >
              ROLE <span style={{ color: '#E53E3E' }}>*</span>
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {visibleRoles.map((role) => {
                const active = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    style={{
                      flex: '1 1 130px',
                      padding: '10px 8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: `1.5px solid ${active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-border)'}`,
                      background: active ? 'var(--pgn-color-primary-light)' : '#fff',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{
                      margin: 0, fontSize: '13px', fontWeight: 600, color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-gray-900)',
                    }}
                    >{role.label}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-text-light)' }}>{role.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedRole === 'trainee' && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{
                fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-text-light)', letterSpacing: '0.07em', display: 'block', marginBottom: '8px',
              }}
              >
                TRAINEE TYPE <span style={{ color: '#E53E3E' }}>*</span>
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {TRAINEE_TYPES.map((type) => {
                  const active = traineeType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setTraineeType(type.id)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: `1.5px solid ${active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-border)'}`,
                        background: active ? 'var(--pgn-color-primary-light)' : '#fff',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{
                        margin: 0, fontSize: '14px', fontWeight: 600, color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-gray-900)',
                      }}
                      >{type.label}
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: '12px', color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-text-light)' }}>{type.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {apiError && (
            <div
              ref={apiErrorRef}
              style={{
                background: '#FDE8E8', color: '#9B1C1C', border: '1px solid #F8B4B4', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '13.5px',
              }}
            >
              {apiError}
            </div>
          )}

          {!isAssignment && shouldShowCity && cities.length === 0 && (
            <div style={{
              background: '#FFF8E5', color: '#7A4D00', border: '1px solid #F0D28A', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '13.5px',
            }}
            >
              No cities are available yet. Add cities before creating Middle Admin or Data Admin accounts.
            </div>
          )}

          {!isAssignment && selectedRole === 'trainee' && traineeType === 'stp' && batches.length === 0 && (
            <div style={{
              background: '#FFF8E5', color: '#7A4D00', border: '1px solid #F0D28A', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '13.5px',
            }}
            >
              No batches are available yet. Add batches before creating STP trainee accounts.
            </div>
          )}

          {isAssignment ? (
            <>
              <SectionHeader title="SIGN-IN APPROVAL" note="Role only; profile details can be completed later." />
              <div style={{
                background: 'var(--pgn-color-gray-100)', border: '1px solid var(--pgn-color-border)', borderRadius: '8px', padding: '14px 16px',
              }}
              >
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--pgn-color-gray-900)' }}>
                  This approval will create an FBR profile for <strong>{assignmentEmail}</strong>
                  {' '}
                  and assign the selected role.
                </p>
              </div>
            </>
          ) : (
            <>
              <SectionHeader title="INFORMATION" note={contextText} />
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
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pgn-color-text-light)', fontSize: '12px', marginTop: '6px',
            }}
            >
              <FontAwesomeIcon icon={faHome} />
              <span>Batch is required only for STP trainees.</span>
            </div>
          )}
        </div>

        <div style={{
          padding: '14px 28px', borderTop: '1px solid var(--pgn-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#fff', flexShrink: 0,
        }}
        >
          <Button variant="tertiary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
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
            <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px', marginRight: '7px' }} />
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

AddUserModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  callerProfile: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.string),
    city: PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }),
  }),
  cities: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })),
  batches: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })),
  assignmentUser: PropTypes.shape({
    id: PropTypes.number,
    username: PropTypes.string,
    email: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
  }),
};

AddUserModal.defaultProps = {
  allowedRoles: ['instructor', 'trainee'],
  callerProfile: { roles: [], city: null },
  cities: [],
  batches: [],
  assignmentUser: null,
};

export default AddUserModal;
