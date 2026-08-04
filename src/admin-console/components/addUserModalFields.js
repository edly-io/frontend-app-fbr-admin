import messages from './messages';

// ─── Add User modal field / role / trainee-type definitions ────────────────
//
// Pure data + helper functions extracted out of `AddUserModal.jsx` so the
// (fairly large) form-shaping and payload/validation logic can be read and
// tested independently of the modal's rendering code. Labels/placeholders
// are message *descriptors* (not yet formatted) so this module has no
// dependency on `useIntl`/a render context - the component formats them at
// render time via `intl.formatMessage`.

export const ROLE_OPTIONS = [
  { id: 'super_admin', labelMessage: messages.roleSuperAdminLabel, descMessage: messages.roleSuperAdminDesc },
  { id: 'middle_admin', labelMessage: messages.roleMiddleAdminLabel, descMessage: messages.roleMiddleAdminDesc },
  { id: 'data_admin', labelMessage: messages.roleDataAdminLabel, descMessage: messages.roleDataAdminDesc },
  { id: 'instructor', labelMessage: messages.roleInstructorLabel, descMessage: messages.roleInstructorDesc },
  { id: 'trainee', labelMessage: messages.roleTraineeLabel, descMessage: messages.roleTraineeDesc },
];

export const TRAINEE_TYPES = [
  { id: 'stp', labelMessage: messages.traineeTypeStpLabel, descMessage: messages.traineeTypeStpDesc },
  { id: 'dst_ist', labelMessage: messages.traineeTypeDstIstLabel, descMessage: messages.traineeTypeDstIstDesc },
];

export const F = {
  fullName: {
    id: 'fullName', key: 'full_name', labelMessage: messages.fieldFullNameLabel, placeholderMessage: messages.fieldFullNamePlaceholder, type: 'text', required: true, full: true, group: 'base',
  },
  email: {
    id: 'email', key: 'email', labelMessage: messages.fieldEmailLabel, placeholderMessage: messages.fieldEmailPlaceholder, type: 'email', required: true, group: 'base',
  },
  cnic: {
    id: 'cnic', key: 'cnic', labelMessage: messages.fieldCnicLabel, placeholderMessage: messages.fieldCnicPlaceholder, helperMessage: messages.fieldCnicHelper, type: 'text', group: 'base',
  },
  mobile: {
    id: 'mobile', key: 'mobile', labelMessage: messages.fieldMobileLabel, placeholderMessage: messages.fieldMobilePlaceholder, type: 'tel', required: true, group: 'base',
  },
  fieldOrganisation: {
    id: 'fieldOrganisation', key: 'field_organisation', labelMessage: messages.fieldFieldOrganisationLabel, placeholderMessage: messages.fieldFieldOrganisationPlaceholder, type: 'text', required: true, full: true, group: 'base',
  },
  city: {
    id: 'city', key: 'city', labelMessage: messages.fieldCityLabel, placeholderMessage: messages.fieldCityPlaceholder, type: 'select', required: true, group: 'base',
  },
  emergencyContactName: {
    id: 'emergencyContactName', key: 'emergency_contact_name', labelMessage: messages.fieldEmergencyContactNameLabel, type: 'text', group: 'base',
  },
  emergencyContactPhone: {
    id: 'emergencyContactPhone', key: 'emergency_contact_phone', labelMessage: messages.fieldEmergencyContactPhoneLabel, type: 'tel', group: 'base',
  },
  educationDegree: {
    id: 'educationDegree', key: 'education_degree', labelMessage: messages.fieldEducationDegreeLabel, type: 'text', group: 'base',
  },
  educationInstitute: {
    id: 'educationInstitute', key: 'education_institute', labelMessage: messages.fieldEducationInstituteLabel, type: 'text', group: 'base',
  },
  educationYear: {
    id: 'educationYear', key: 'education_year', labelMessage: messages.fieldEducationYearLabel, type: 'number', group: 'base',
  },
  fieldOfExpertise: {
    id: 'fieldOfExpertise', key: 'field_of_expertise', labelMessage: messages.fieldFieldOfExpertiseLabel, placeholderMessage: messages.fieldFieldOfExpertisePlaceholder, type: 'text', required: true, full: true, group: 'instructor_profile',
  },
  dateOfBirth: {
    id: 'dateOfBirth', key: 'date_of_birth', labelMessage: messages.fieldDateOfBirthLabel, type: 'date', required: true, group: 'trainee_profile',
  },
  designation: {
    id: 'designation', key: 'designation', labelMessage: messages.fieldDesignationLabel, placeholderMessage: messages.fieldDesignationPlaceholder, type: 'text', required: true, group: 'trainee_profile',
  },
  bpsGrade: {
    id: 'bpsGrade', key: 'bps_grade', labelMessage: messages.fieldBpsGradeLabel, placeholderMessage: messages.fieldBpsGradePlaceholder, type: 'number', required: true, group: 'trainee_profile',
  },
  batch: {
    id: 'batch', key: 'batch', labelMessage: messages.fieldBatchLabel, placeholderMessage: messages.fieldBatchPlaceholder, type: 'select', group: 'trainee_profile',
  },
  serviceHistory: {
    id: 'serviceHistory', key: 'service_history', labelMessage: messages.fieldServiceHistoryLabel, placeholderMessage: messages.fieldServiceHistoryPlaceholder, type: 'textarea', group: 'trainee_profile',
  },
  hostelPreference: {
    id: 'hostelPreference', key: 'hostel_preference', labelMessage: messages.fieldHostelPreferenceLabel, placeholderMessage: messages.fieldHostelPreferencePlaceholder, type: 'text', group: 'trainee_profile',
  },
  languagesAwardsPublications: {
    id: 'languagesAwardsPublications', key: 'languages_awards_publications', labelMessage: messages.fieldLanguagesAwardsPublicationsLabel, type: 'textarea', full: true,
  },
};

export const ADMIN_ROLES = ['super_admin', 'middle_admin', 'data_admin'];
export const NUMBER_KEYS = ['bps_grade', 'city', 'batch', 'education_year'];
export const FIELD_ID_BY_API_KEY = Object.values(F).reduce((acc, field) => {
  acc[field.key] = field.id;
  return acc;
}, {});

export const normalizeValue = value => (typeof value === 'string' ? value.trim() : value);

export const sanitizeCnicValue = value => String(value || '').replace(/\D/g, '').slice(0, 13);

export const getPakistanMobileSubscriber = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('92')) { digits = digits.slice(2); }
  if (digits.startsWith('0')) { digits = digits.slice(1); }
  if (digits && digits[0] !== '3') { digits = ''; }
  return digits.slice(0, 10);
};

export const formatPakistanMobileValue = value => `+92${getPakistanMobileSubscriber(value)}`;

export const normalizeFieldInputValue = (field, value) => {
  if (field.id === 'cnic') { return sanitizeCnicValue(value); }
  if (field.id === 'mobile' || field.id === 'emergencyContactPhone') { return formatPakistanMobileValue(value); }
  return value;
};

export const normalizePayloadFieldValue = (field, value) => {
  if (field.id === 'cnic') { return sanitizeCnicValue(value); }
  if (field.id === 'mobile' || field.id === 'emergencyContactPhone') {
    const subscriber = getPakistanMobileSubscriber(value);
    return subscriber ? `+92${subscriber}` : '';
  }
  return normalizeValue(value);
};

export const isValidPakistanMobile = value => /^3\d{9}$/.test(getPakistanMobileSubscriber(value));

export const toErrorMessage = (value) => {
  if (Array.isArray(value)) { return value.join(' '); }
  if (typeof value === 'string') { return value; }
  return '';
};

/**
 * Maps a failed create/assign-role request into field-level errors plus a
 * top-level API error string. `correctHighlightedFieldsMessage` and
 * `fallbackMessage` are pre-formatted (localized) strings supplied by the
 * caller so this helper stays decoupled from `useIntl`.
 */
export const getSubmissionErrorState = (error, { fallbackMessage, correctHighlightedFieldsMessage }) => {
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
      apiError: correctHighlightedFieldsMessage,
    };
  }

  return {
    fieldErrors: {},
    apiError: toErrorMessage(data.detail)
      || toErrorMessage(data.non_field_errors)
      || fallbackMessage,
  };
};

export const getCreateFieldsForRole = (role, traineeType, shouldShowCity) => {
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

export const toCreatePayload = (role, traineeType, values, shouldSendCity) => {
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

export const toAssignPayload = role => ({ role });

export const getFieldInputValue = (field, value) => {
  if (field.id === 'mobile' || field.id === 'emergencyContactPhone') {
    return formatPakistanMobileValue(value);
  }

  if (field.id === 'cnic') {
    return sanitizeCnicValue(value);
  }

  return value || '';
};

export const getFieldInputMaxLength = (field) => {
  if (field.id === 'cnic') {
    return 13;
  }

  if (field.id === 'mobile' || field.id === 'emergencyContactPhone') {
    return 13;
  }

  return undefined;
};

export const getRowKey = row => row.map(field => field.id).join('-');
