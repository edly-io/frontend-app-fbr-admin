import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // ─── Add User / Assign Role modal ─────────────────────────────────────────
  addUserEyebrowCreate: {
    id: 'fbrAdmin.addUserModal.eyebrow.create',
    defaultMessage: 'NEW RECORD',
    description: 'Small eyebrow label shown above the Add User modal title when creating a user.',
  },
  addUserEyebrowAssignment: {
    id: 'fbrAdmin.addUserModal.eyebrow.assignment',
    defaultMessage: 'SIGN-IN APPROVAL',
    description: 'Small eyebrow label shown above the Add User modal title when approving a sign-in.',
  },
  addUserTitleCreate: {
    id: 'fbrAdmin.addUserModal.title.create',
    defaultMessage: 'Add User',
    description: 'Add User modal title when creating a user.',
  },
  addUserTitleAssignment: {
    id: 'fbrAdmin.addUserModal.title.assignment',
    defaultMessage: 'Approve Sign-in',
    description: 'Add User modal title when approving a sign-in.',
  },
  addUserSubtitleCreate: {
    id: 'fbrAdmin.addUserModal.subtitle.create',
    defaultMessage: 'Create a new account and send credentials by WhatsApp',
    description: 'Add User modal subtitle when creating a user.',
  },
  addUserSubtitleAssignment: {
    id: 'fbrAdmin.addUserModal.subtitle.assignment',
    defaultMessage: 'Create an FBR profile and assign access',
    description: 'Add User modal subtitle when approving a sign-in.',
  },
  roleSectionLabel: {
    id: 'fbrAdmin.addUserModal.role.label',
    defaultMessage: 'ROLE',
    description: 'Label for the role selector section of the Add User modal.',
  },
  traineeTypeSectionLabel: {
    id: 'fbrAdmin.addUserModal.traineeType.label',
    defaultMessage: 'TRAINEE TYPE',
    description: 'Label for the trainee type selector section of the Add User modal.',
  },
  roleSuperAdminLabel: {
    id: 'fbrAdmin.addUserModal.role.superAdmin.label',
    defaultMessage: 'Super Admin',
    description: 'Role option label for Super Admin.',
  },
  roleSuperAdminDesc: {
    id: 'fbrAdmin.addUserModal.role.superAdmin.desc',
    defaultMessage: 'Platform-wide',
    description: 'Role option description for Super Admin.',
  },
  roleMiddleAdminLabel: {
    id: 'fbrAdmin.addUserModal.role.middleAdmin.label',
    defaultMessage: 'Middle Admin',
    description: 'Role option label for Middle Admin.',
  },
  roleMiddleAdminDesc: {
    id: 'fbrAdmin.addUserModal.role.middleAdmin.desc',
    defaultMessage: 'City scope',
    description: 'Role option description for Middle Admin.',
  },
  roleDataAdminLabel: {
    id: 'fbrAdmin.addUserModal.role.dataAdmin.label',
    defaultMessage: 'Data Admin',
    description: 'Role option label for Data Admin.',
  },
  roleDataAdminDesc: {
    id: 'fbrAdmin.addUserModal.role.dataAdmin.desc',
    defaultMessage: 'Operations',
    description: 'Role option description for Data Admin.',
  },
  roleInstructorLabel: {
    id: 'fbrAdmin.addUserModal.role.instructor.label',
    defaultMessage: 'Instructor',
    description: 'Role option label for Instructor.',
  },
  roleInstructorDesc: {
    id: 'fbrAdmin.addUserModal.role.instructor.desc',
    defaultMessage: 'Trainer',
    description: 'Role option description for Instructor.',
  },
  roleTraineeLabel: {
    id: 'fbrAdmin.addUserModal.role.trainee.label',
    defaultMessage: 'Trainee',
    description: 'Role option label for Trainee.',
  },
  roleTraineeDesc: {
    id: 'fbrAdmin.addUserModal.role.trainee.desc',
    defaultMessage: 'Learner',
    description: 'Role option description for Trainee.',
  },
  traineeTypeStpLabel: {
    id: 'fbrAdmin.addUserModal.traineeType.stp.label',
    defaultMessage: 'STP',
    description: 'Trainee type option label for STP.',
  },
  traineeTypeStpDesc: {
    id: 'fbrAdmin.addUserModal.traineeType.stp.desc',
    defaultMessage: 'Specialised training programme',
    description: 'Trainee type option description for STP.',
  },
  traineeTypeDstIstLabel: {
    id: 'fbrAdmin.addUserModal.traineeType.dstIst.label',
    defaultMessage: 'DST / IST',
    description: 'Trainee type option label for DST / IST.',
  },
  traineeTypeDstIstDesc: {
    id: 'fbrAdmin.addUserModal.traineeType.dstIst.desc',
    defaultMessage: 'Domain / in-service training',
    description: 'Trainee type option description for DST / IST.',
  },
  fieldFullNameLabel: {
    id: 'fbrAdmin.addUserModal.field.fullName.label',
    defaultMessage: 'FULL NAME',
    description: 'Add User modal field label for full name.',
  },
  fieldFullNamePlaceholder: {
    id: 'fbrAdmin.addUserModal.field.fullName.placeholder',
    defaultMessage: 'e.g. Asma Khan',
    description: 'Add User modal field placeholder for full name.',
  },
  fieldEmailLabel: {
    id: 'fbrAdmin.addUserModal.field.email.label',
    defaultMessage: 'EMAIL',
    description: 'Add User modal field label for email.',
  },
  fieldEmailPlaceholder: {
    id: 'fbrAdmin.addUserModal.field.email.placeholder',
    defaultMessage: 'name@fbr.gov.pk',
    description: 'Add User modal field placeholder for email.',
  },
  fieldCnicLabel: {
    id: 'fbrAdmin.addUserModal.field.cnic.label',
    defaultMessage: 'CNIC',
    description: 'Add User modal field label for CNIC.',
  },
  fieldCnicPlaceholder: {
    id: 'fbrAdmin.addUserModal.field.cnic.placeholder',
    defaultMessage: '13 digits without dashes',
    description: 'Add User modal field placeholder for CNIC.',
  },
  fieldCnicHelper: {
    id: 'fbrAdmin.addUserModal.field.cnic.helper',
    defaultMessage: 'Use 13 digits, no dashes.',
    description: 'Add User modal helper text for CNIC.',
  },
  fieldMobileLabel: {
    id: 'fbrAdmin.addUserModal.field.mobile.label',
    defaultMessage: 'MOBILE',
    description: 'Add User modal field label for mobile.',
  },
  fieldMobilePlaceholder: {
    id: 'fbrAdmin.addUserModal.field.mobile.placeholder',
    defaultMessage: '+92 3XX XXXXXXX',
    description: 'Add User modal field placeholder for mobile.',
  },
  fieldFieldOrganisationLabel: {
    id: 'fbrAdmin.addUserModal.field.fieldOrganisation.label',
    defaultMessage: 'FIELD ORGANISATION',
    description: 'Add User modal field label for field organisation.',
  },
  fieldFieldOrganisationPlaceholder: {
    id: 'fbrAdmin.addUserModal.field.fieldOrganisation.placeholder',
    defaultMessage: 'e.g. RTO Lahore / FBR Training Academy',
    description: 'Add User modal field placeholder for field organisation.',
  },
  fieldCityLabel: {
    id: 'fbrAdmin.addUserModal.field.city.label',
    defaultMessage: 'CITY',
    description: 'Add User modal field label for city.',
  },
  fieldCityPlaceholder: {
    id: 'fbrAdmin.addUserModal.field.city.placeholder',
    defaultMessage: 'Select city...',
    description: 'Add User modal field placeholder for city.',
  },
  fieldEmergencyContactNameLabel: {
    id: 'fbrAdmin.addUserModal.field.emergencyContactName.label',
    defaultMessage: 'EMERGENCY CONTACT NAME',
    description: 'Add User modal field label for emergency contact name.',
  },
  fieldEmergencyContactPhoneLabel: {
    id: 'fbrAdmin.addUserModal.field.emergencyContactPhone.label',
    defaultMessage: 'EMERGENCY CONTACT PHONE',
    description: 'Add User modal field label for emergency contact phone.',
  },
  fieldEducationDegreeLabel: {
    id: 'fbrAdmin.addUserModal.field.educationDegree.label',
    defaultMessage: 'EDUCATION DEGREE',
    description: 'Add User modal field label for education degree.',
  },
  fieldEducationInstituteLabel: {
    id: 'fbrAdmin.addUserModal.field.educationInstitute.label',
    defaultMessage: 'EDUCATION INSTITUTE',
    description: 'Add User modal field label for education institute.',
  },
  fieldEducationYearLabel: {
    id: 'fbrAdmin.addUserModal.field.educationYear.label',
    defaultMessage: 'EDUCATION YEAR',
    description: 'Add User modal field label for education year.',
  },
  fieldFieldOfExpertiseLabel: {
    id: 'fbrAdmin.addUserModal.field.fieldOfExpertise.label',
    defaultMessage: 'FIELD OF EXPERTISE',
    description: 'Add User modal field label for field of expertise.',
  },
  fieldFieldOfExpertisePlaceholder: {
    id: 'fbrAdmin.addUserModal.field.fieldOfExpertise.placeholder',
    defaultMessage: 'e.g. Inland Revenue',
    description: 'Add User modal field placeholder for field of expertise.',
  },
  fieldDateOfBirthLabel: {
    id: 'fbrAdmin.addUserModal.field.dateOfBirth.label',
    defaultMessage: 'DATE OF BIRTH',
    description: 'Add User modal field label for date of birth.',
  },
  fieldDesignationLabel: {
    id: 'fbrAdmin.addUserModal.field.designation.label',
    defaultMessage: 'DESIGNATION',
    description: 'Add User modal field label for designation.',
  },
  fieldDesignationPlaceholder: {
    id: 'fbrAdmin.addUserModal.field.designation.placeholder',
    defaultMessage: 'e.g. Assistant Commissioner IR',
    description: 'Add User modal field placeholder for designation.',
  },
  fieldBpsGradeLabel: {
    id: 'fbrAdmin.addUserModal.field.bpsGrade.label',
    defaultMessage: 'BPS GRADE',
    description: 'Add User modal field label for BPS grade.',
  },
  fieldBpsGradePlaceholder: {
    id: 'fbrAdmin.addUserModal.field.bpsGrade.placeholder',
    defaultMessage: '17',
    description: 'Add User modal field placeholder for BPS grade.',
  },
  fieldBatchLabel: {
    id: 'fbrAdmin.addUserModal.field.batch.label',
    defaultMessage: 'BATCH',
    description: 'Add User modal field label for batch.',
  },
  fieldBatchPlaceholder: {
    id: 'fbrAdmin.addUserModal.field.batch.placeholder',
    defaultMessage: 'Select batch...',
    description: 'Add User modal field placeholder for batch.',
  },
  fieldServiceHistoryLabel: {
    id: 'fbrAdmin.addUserModal.field.serviceHistory.label',
    defaultMessage: 'SERVICE HISTORY',
    description: 'Add User modal field label for service history.',
  },
  fieldServiceHistoryPlaceholder: {
    id: 'fbrAdmin.addUserModal.field.serviceHistory.placeholder',
    defaultMessage: 'Previous postings, if available',
    description: 'Add User modal field placeholder for service history.',
  },
  fieldHostelPreferenceLabel: {
    id: 'fbrAdmin.addUserModal.field.hostelPreference.label',
    defaultMessage: 'HOSTEL PREFERENCE',
    description: 'Add User modal field label for hostel preference.',
  },
  fieldHostelPreferencePlaceholder: {
    id: 'fbrAdmin.addUserModal.field.hostelPreference.placeholder',
    defaultMessage: 'Hostel Required / Own Accommodation',
    description: 'Add User modal field placeholder for hostel preference.',
  },
  fieldLanguagesAwardsPublicationsLabel: {
    id: 'fbrAdmin.addUserModal.field.languagesAwardsPublications.label',
    defaultMessage: 'LANGUAGES, AWARDS, PUBLICATIONS',
    description: 'Add User modal field label for languages, awards and publications.',
  },
  contextTraineeStp: {
    id: 'fbrAdmin.addUserModal.context.traineeStp',
    defaultMessage: 'STP trainee account',
    description: 'Context note shown for STP trainee accounts.',
  },
  contextTraineeDstIst: {
    id: 'fbrAdmin.addUserModal.context.traineeDstIst',
    defaultMessage: 'DST / IST trainee account',
    description: 'Context note shown for DST / IST trainee accounts.',
  },
  contextInstructor: {
    id: 'fbrAdmin.addUserModal.context.instructor',
    defaultMessage: 'Instructor account',
    description: 'Context note shown for instructor accounts.',
  },
  contextDataAdminCityLocked: {
    id: 'fbrAdmin.addUserModal.context.dataAdminCityLocked',
    defaultMessage: 'Data Admin city will be locked to your city',
    description: 'Context note shown for data admin accounts created by a middle admin.',
  },
  contextGenericAccount: {
    id: 'fbrAdmin.addUserModal.context.genericAccount',
    defaultMessage: '{role} account',
    description: 'Generic context note shown for a role, e.g. "Super Admin account".',
  },
  roleFallbackUser: {
    id: 'fbrAdmin.addUserModal.context.roleFallback',
    defaultMessage: 'User',
    description: 'Fallback role name used in the generic context note when the role is unknown.',
  },
  sectionInformation: {
    id: 'fbrAdmin.addUserModal.section.information',
    defaultMessage: 'INFORMATION',
    description: 'Section header shown above the create-user field rows.',
  },
  sectionSignInApproval: {
    id: 'fbrAdmin.addUserModal.section.signInApproval',
    defaultMessage: 'SIGN-IN APPROVAL',
    description: 'Section header shown above the sign-in approval summary.',
  },
  sectionSignInApprovalNote: {
    id: 'fbrAdmin.addUserModal.section.signInApprovalNote',
    defaultMessage: 'Role only; profile details can be completed later.',
    description: 'Note shown next to the sign-in approval section header.',
  },
  assignmentSummary: {
    id: 'fbrAdmin.addUserModal.assignmentSummary',
    defaultMessage: 'This approval will create an FBR profile for {email} and assign the selected role.',
    description: 'Summary text shown in the sign-in approval flow, naming the user being approved.',
  },
  noCitiesWarning: {
    id: 'fbrAdmin.addUserModal.warning.noCities',
    defaultMessage: 'No cities are available yet. Add cities before creating Middle Admin or Data Admin accounts.',
    description: 'Warning shown when no cities are configured but one is required for the selected role.',
  },
  noBatchesWarning: {
    id: 'fbrAdmin.addUserModal.warning.noBatches',
    defaultMessage: 'No batches are available yet. Add batches before creating STP trainee accounts.',
    description: 'Warning shown when no batches are configured but one is required for STP trainees.',
  },
  batchHintStpOnly: {
    id: 'fbrAdmin.addUserModal.hint.batchStpOnly',
    defaultMessage: 'Batch is required only for STP trainees.',
    description: 'Hint clarifying that batch is only required for STP trainees.',
  },
  cancelButton: {
    id: 'fbrAdmin.addUserModal.button.cancel',
    defaultMessage: 'Cancel',
    description: 'Button label to cancel and close the Add User modal.',
  },
  createUserButton: {
    id: 'fbrAdmin.addUserModal.button.createUser',
    defaultMessage: 'Create User',
    description: 'Button label to submit the create-user form.',
  },
  approveUserButton: {
    id: 'fbrAdmin.addUserModal.button.approveUser',
    defaultMessage: 'Approve User',
    description: 'Button label to submit the sign-in approval form.',
  },
  savingButton: {
    id: 'fbrAdmin.addUserModal.button.saving',
    defaultMessage: 'Saving...',
    description: 'Button label shown while the Add User form is submitting.',
  },
  fieldRequiredError: {
    id: 'fbrAdmin.addUserModal.error.fieldRequired',
    defaultMessage: 'This field is required',
    description: 'Validation error shown when a required field is left empty.',
  },
  cnicFormatError: {
    id: 'fbrAdmin.addUserModal.error.cnicFormat',
    defaultMessage: 'CNIC must be 13 digits without dashes',
    description: 'Validation error shown when the CNIC is not 13 digits.',
  },
  mobileFormatError: {
    id: 'fbrAdmin.addUserModal.error.mobileFormat',
    defaultMessage: 'Mobile must start with 3 and contain 10 digits after +92',
    description: 'Validation error shown when the mobile number is invalid.',
  },
  emergencyPhoneFormatError: {
    id: 'fbrAdmin.addUserModal.error.emergencyPhoneFormat',
    defaultMessage: 'Emergency phone must start with 3 and contain 10 digits after +92',
    description: 'Validation error shown when the emergency contact phone number is invalid.',
  },
  bpsGradeNumericError: {
    id: 'fbrAdmin.addUserModal.error.bpsGradeNumeric',
    defaultMessage: 'Enter a numeric grade',
    description: 'Validation error shown when the BPS grade is not numeric.',
  },
  noBatchesAvailableError: {
    id: 'fbrAdmin.addUserModal.error.noBatchesAvailable',
    defaultMessage: 'No batches are available yet',
    description: 'Validation error shown when submitting an STP trainee with no batches configured.',
  },
  correctHighlightedFieldsError: {
    id: 'fbrAdmin.addUserModal.error.correctHighlightedFields',
    defaultMessage: 'Please correct the highlighted fields.',
    description: 'Generic API error message shown when field-level validation errors are returned.',
  },
  unableToCreateUserError: {
    id: 'fbrAdmin.addUserModal.error.unableToCreate',
    defaultMessage: 'Unable to create user.',
    description: 'Fallback error message when creating a user fails.',
  },
  unableToApproveUserError: {
    id: 'fbrAdmin.addUserModal.error.unableToApprove',
    defaultMessage: 'Unable to approve user.',
    description: 'Fallback error message when approving a sign-in fails.',
  },

  // ─── Bulk Import Users modal ──────────────────────────────────────────────
  bulkImportEyebrow: {
    id: 'fbrAdmin.bulkImportModal.eyebrow',
    defaultMessage: 'BULK IMPORT',
    description: 'Small eyebrow label shown above the Bulk Import modal title.',
  },
  bulkImportTitle: {
    id: 'fbrAdmin.bulkImportModal.title',
    defaultMessage: 'Import Users',
    description: 'Bulk Import modal title.',
  },
  bulkImportSubtitle: {
    id: 'fbrAdmin.bulkImportModal.subtitle',
    defaultMessage: 'Upload a CSV to validate or create trainees and instructors.',
    description: 'Bulk Import modal subtitle.',
  },
  bulkImportNoPermission: {
    id: 'fbrAdmin.bulkImportModal.noPermission',
    defaultMessage: 'You do not have permission to import trainees or instructors.',
    description: 'Warning shown when the caller cannot import any role.',
  },
  bulkImportTypeLabel: {
    id: 'fbrAdmin.bulkImportModal.importType.label',
    defaultMessage: 'Import Type',
    description: 'Label for the role selector in the Bulk Import modal.',
  },
  bulkImportRoleTrainees: {
    id: 'fbrAdmin.bulkImportModal.role.trainees',
    defaultMessage: 'Trainees',
    description: 'Bulk import role option label for trainees.',
  },
  bulkImportRoleInstructors: {
    id: 'fbrAdmin.bulkImportModal.role.instructors',
    defaultMessage: 'Instructors',
    description: 'Bulk import role option label for instructors.',
  },
  bulkImportHintTrainee: {
    id: 'fbrAdmin.bulkImportModal.hint.trainee',
    defaultMessage: 'CSV columns include city, trainee_type, batch, date_of_birth, designation, and BPS grade.',
    description: 'Hint describing the expected CSV columns for a trainee import.',
  },
  bulkImportHintInstructor: {
    id: 'fbrAdmin.bulkImportModal.hint.instructor',
    defaultMessage: 'CSV columns include city, field_of_expertise, and languages/awards/publications.',
    description: 'Hint describing the expected CSV columns for an instructor import.',
  },
  downloadSampleButton: {
    id: 'fbrAdmin.bulkImportModal.button.downloadSample',
    defaultMessage: 'Download Sample CSV',
    description: 'Button label to download a sample CSV file for the selected role.',
  },
  downloadingButton: {
    id: 'fbrAdmin.bulkImportModal.button.downloading',
    defaultMessage: 'Downloading...',
    description: 'Button label shown while the sample CSV is downloading.',
  },
  dryRunCheckboxLabel: {
    id: 'fbrAdmin.bulkImportModal.dryRun.label',
    defaultMessage: 'Dry run only',
    description: 'Checkbox label to toggle dry-run validation instead of a real import.',
  },
  csvFileLabel: {
    id: 'fbrAdmin.bulkImportModal.csvFile.label',
    defaultMessage: 'CSV File',
    description: 'Label for the CSV file input in the Bulk Import modal.',
  },
  closeButton: {
    id: 'fbrAdmin.bulkImportModal.button.close',
    defaultMessage: 'Close',
    description: 'Button label to close the Bulk Import modal.',
  },
  importUsersButton: {
    id: 'fbrAdmin.bulkImportModal.button.importUsers',
    defaultMessage: 'Import Users',
    description: 'Button label to submit a real (non-dry-run) bulk import.',
  },
  runValidationButton: {
    id: 'fbrAdmin.bulkImportModal.button.runValidation',
    defaultMessage: 'Run Validation',
    description: 'Button label to submit a dry-run bulk import validation.',
  },
  processingButton: {
    id: 'fbrAdmin.bulkImportModal.button.processing',
    defaultMessage: 'Processing...',
    description: 'Button label shown while a bulk import is submitting.',
  },
  resultModeLabel: {
    id: 'fbrAdmin.bulkImportModal.result.mode',
    defaultMessage: 'Mode',
    description: 'Result summary card label for the import mode.',
  },
  resultModeDryRun: {
    id: 'fbrAdmin.bulkImportModal.result.modeDryRun',
    defaultMessage: 'Dry run',
    description: 'Result summary value shown when the import was a dry run.',
  },
  resultModeImport: {
    id: 'fbrAdmin.bulkImportModal.result.modeImport',
    defaultMessage: 'Import',
    description: 'Result summary value shown when the import was a real import.',
  },
  resultTotalRows: {
    id: 'fbrAdmin.bulkImportModal.result.totalRows',
    defaultMessage: 'Total rows',
    description: 'Result summary card label for the total number of CSV rows.',
  },
  resultValidRows: {
    id: 'fbrAdmin.bulkImportModal.result.validRows',
    defaultMessage: 'Valid rows',
    description: 'Result summary card label for the number of valid rows in a dry run.',
  },
  resultCreated: {
    id: 'fbrAdmin.bulkImportModal.result.created',
    defaultMessage: 'Created',
    description: 'Result summary card label for the number of created rows in a real import.',
  },
  resultFailed: {
    id: 'fbrAdmin.bulkImportModal.result.failed',
    defaultMessage: 'Failed',
    description: 'Result summary card label for the number of failed rows.',
  },
  resultColumnRow: {
    id: 'fbrAdmin.bulkImportModal.result.column.row',
    defaultMessage: 'ROW',
    description: 'Result table column header for the CSV row number.',
  },
  resultColumnEmail: {
    id: 'fbrAdmin.bulkImportModal.result.column.email',
    defaultMessage: 'EMAIL',
    description: 'Result table column header for the row email.',
  },
  resultColumnStatus: {
    id: 'fbrAdmin.bulkImportModal.result.column.status',
    defaultMessage: 'STATUS',
    description: 'Result table column header for the row status.',
  },
  resultColumnErrors: {
    id: 'fbrAdmin.bulkImportModal.result.column.errors',
    defaultMessage: 'ERRORS',
    description: 'Result table column header for row errors.',
  },
  resultStatusError: {
    id: 'fbrAdmin.bulkImportModal.result.status.error',
    defaultMessage: 'Error',
    description: 'Result row status badge label for a failed row.',
  },
  resultStatusValid: {
    id: 'fbrAdmin.bulkImportModal.result.status.valid',
    defaultMessage: 'Valid',
    description: 'Result row status badge label for a valid row in a dry run.',
  },
  resultStatusCreated: {
    id: 'fbrAdmin.bulkImportModal.result.status.created',
    defaultMessage: 'Created',
    description: 'Result row status badge label for a created row in a real import.',
  },
  emptyValue: {
    id: 'fbrAdmin.bulkImportModal.emptyValue',
    defaultMessage: '—',
    description: 'Placeholder dash shown for an empty result table cell.',
  },
  chooseFileError: {
    id: 'fbrAdmin.bulkImportModal.error.chooseFile',
    defaultMessage: 'Please choose a CSV file.',
    description: 'Validation error shown when submitting without selecting a CSV file.',
  },
  unableToDownloadSampleError: {
    id: 'fbrAdmin.bulkImportModal.error.unableToDownloadSample',
    defaultMessage: 'Unable to download sample CSV.',
    description: 'Fallback error message when downloading the sample CSV fails.',
  },
  unableToImportUsersError: {
    id: 'fbrAdmin.bulkImportModal.error.unableToImportUsers',
    defaultMessage: 'Unable to import users.',
    description: 'Fallback error message when the bulk import fails.',
  },

  // ─── View User modal ──────────────────────────────────────────────────────
  viewUserSectionProfileInfo: {
    id: 'fbrAdmin.viewUserModal.section.profileInformation',
    defaultMessage: 'PROFILE INFORMATION',
    description: 'Section header for the base profile information in the View User modal.',
  },
  viewUserSectionInstructorProfile: {
    id: 'fbrAdmin.viewUserModal.section.instructorProfile',
    defaultMessage: 'INSTRUCTOR PROFILE',
    description: 'Section header for the instructor-specific profile fields.',
  },
  viewUserSectionTraineeProfile: {
    id: 'fbrAdmin.viewUserModal.section.traineeProfile',
    defaultMessage: 'TRAINEE PROFILE',
    description: 'Section header for the trainee-specific profile fields.',
  },
  viewUserTabInstructor: {
    id: 'fbrAdmin.viewUserModal.tab.instructor',
    defaultMessage: 'Instructor Profile',
    description: 'Tab label to switch to the instructor profile view.',
  },
  viewUserTabTrainee: {
    id: 'fbrAdmin.viewUserModal.tab.trainee',
    defaultMessage: 'Trainee Profile',
    description: 'Tab label to switch to the trainee profile view.',
  },
  viewUserFieldEmail: {
    id: 'fbrAdmin.viewUserModal.field.email',
    defaultMessage: 'Email',
    description: 'Detail label for the user email in the View User modal.',
  },
  viewUserFieldMobile: {
    id: 'fbrAdmin.viewUserModal.field.mobile',
    defaultMessage: 'Mobile',
    description: 'Detail label for the user mobile number in the View User modal.',
  },
  viewUserFieldCnic: {
    id: 'fbrAdmin.viewUserModal.field.cnic',
    defaultMessage: 'CNIC',
    description: 'Detail label for the user CNIC in the View User modal.',
  },
  viewUserFieldStatus: {
    id: 'fbrAdmin.viewUserModal.field.status',
    defaultMessage: 'Status',
    description: 'Detail label for the user status in the View User modal.',
  },
  viewUserFieldCity: {
    id: 'fbrAdmin.viewUserModal.field.city',
    defaultMessage: 'City',
    description: 'Detail label for the user city in the View User modal.',
  },
  viewUserFieldOrganisation: {
    id: 'fbrAdmin.viewUserModal.field.organisation',
    defaultMessage: 'Field Organisation',
    description: 'Detail label for the field organisation in the View User modal.',
  },
  viewUserFieldEmergencyContact: {
    id: 'fbrAdmin.viewUserModal.field.emergencyContact',
    defaultMessage: 'Emergency Contact',
    description: 'Detail label for the emergency contact name in the View User modal.',
  },
  viewUserFieldEmergencyPhone: {
    id: 'fbrAdmin.viewUserModal.field.emergencyPhone',
    defaultMessage: 'Emergency Phone',
    description: 'Detail label for the emergency contact phone in the View User modal.',
  },
  viewUserFieldEducationDegree: {
    id: 'fbrAdmin.viewUserModal.field.educationDegree',
    defaultMessage: 'Education Degree',
    description: 'Detail label for the education degree in the View User modal.',
  },
  viewUserFieldEducationInstitute: {
    id: 'fbrAdmin.viewUserModal.field.educationInstitute',
    defaultMessage: 'Education Institute',
    description: 'Detail label for the education institute in the View User modal.',
  },
  viewUserFieldEducationYear: {
    id: 'fbrAdmin.viewUserModal.field.educationYear',
    defaultMessage: 'Education Year',
    description: 'Detail label for the education year in the View User modal.',
  },
  viewUserFieldFieldOfExpertise: {
    id: 'fbrAdmin.viewUserModal.field.fieldOfExpertise',
    defaultMessage: 'Field of Expertise',
    description: 'Detail label for the field of expertise in the View User modal.',
  },
  viewUserFieldLanguagesAwardsPublications: {
    id: 'fbrAdmin.viewUserModal.field.languagesAwardsPublications',
    defaultMessage: 'Languages, Awards, Publications',
    description: 'Detail label for languages, awards and publications in the View User modal.',
  },
  viewUserFieldTraineeType: {
    id: 'fbrAdmin.viewUserModal.field.traineeType',
    defaultMessage: 'Trainee Type',
    description: 'Detail label for the trainee type in the View User modal.',
  },
  viewUserFieldBatch: {
    id: 'fbrAdmin.viewUserModal.field.batch',
    defaultMessage: 'Batch',
    description: 'Detail label for the batch in the View User modal.',
  },
  viewUserFieldDateOfBirth: {
    id: 'fbrAdmin.viewUserModal.field.dateOfBirth',
    defaultMessage: 'Date of Birth',
    description: 'Detail label for the date of birth in the View User modal.',
  },
  viewUserFieldDesignation: {
    id: 'fbrAdmin.viewUserModal.field.designation',
    defaultMessage: 'Designation',
    description: 'Detail label for the designation in the View User modal.',
  },
  viewUserFieldBpsGrade: {
    id: 'fbrAdmin.viewUserModal.field.bpsGrade',
    defaultMessage: 'BPS Grade',
    description: 'Detail label for the BPS grade in the View User modal.',
  },
  viewUserFieldHostelPreference: {
    id: 'fbrAdmin.viewUserModal.field.hostelPreference',
    defaultMessage: 'Hostel Preference',
    description: 'Detail label for the hostel preference in the View User modal.',
  },
  viewUserFieldServiceHistory: {
    id: 'fbrAdmin.viewUserModal.field.serviceHistory',
    defaultMessage: 'Service History',
    description: 'Detail label for the service history in the View User modal.',
  },
  viewUserTraineeTypeStp: {
    id: 'fbrAdmin.viewUserModal.traineeType.stp',
    defaultMessage: 'STP',
    description: 'Display value for the STP trainee type.',
  },
  viewUserTraineeTypeDstIst: {
    id: 'fbrAdmin.viewUserModal.traineeType.dstIst',
    defaultMessage: 'DST / IST',
    description: 'Display value for the DST / IST trainee type.',
  },
  viewUserEditButton: {
    id: 'fbrAdmin.viewUserModal.button.edit',
    defaultMessage: 'Edit User',
    description: 'Button label to edit the currently viewed user.',
  },
  viewUserCloseButton: {
    id: 'fbrAdmin.viewUserModal.button.close',
    defaultMessage: 'Close',
    description: 'Button label to close the View User modal.',
  },
});

export default messages;
