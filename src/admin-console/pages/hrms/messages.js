import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  breadcrumbLeaf: {
    id: 'fbrAdmin.hrms.breadcrumb',
    defaultMessage: 'HRMS',
    description: 'Breadcrumb leaf for the HRMS employees page.',
  },
  pageTitle: {
    id: 'fbrAdmin.hrms.title',
    defaultMessage: 'HRMS Employees',
    description: 'Title for the HRMS employees page.',
  },
  pageSubtitle: {
    id: 'fbrAdmin.hrms.subtitle',
    defaultMessage: 'Employee information synced from PayPeople HRMS.',
    description: 'Subtitle for the HRMS employees page.',
  },
  refresh: {
    id: 'fbrAdmin.hrms.refresh',
    defaultMessage: 'Refresh',
    description: 'Button label to refresh HRMS employees.',
  },
  searchPlaceholder: {
    id: 'fbrAdmin.hrms.search.placeholder',
    defaultMessage: 'Search by name, email, CNIC, phone, employee code or ID...',
    description: 'Search placeholder for HRMS employees.',
  },
  employeesCount: {
    id: 'fbrAdmin.hrms.count',
    defaultMessage: '{count} employees',
    description: 'Count of HRMS employees.',
  },
  loadError: {
    id: 'fbrAdmin.hrms.error.load',
    defaultMessage: 'Unable to load HRMS employees.',
    description: 'Fallback error message when HRMS employees fail to load.',
  },
  forbiddenError: {
    id: 'fbrAdmin.hrms.error.forbidden',
    defaultMessage: 'You do not have permission to view HRMS employees.',
    description: 'Permission error shown when HRMS employees endpoint returns 403.',
  },
  emptyState: {
    id: 'fbrAdmin.hrms.empty',
    defaultMessage: 'No HRMS employees found.',
    description: 'Empty state shown when HRMS has no employees.',
  },
  emptySearchState: {
    id: 'fbrAdmin.hrms.empty.search',
    defaultMessage: 'No employees match your search.',
    description: 'Empty state shown when HRMS employee search has no matches.',
  },
  columnEmployee: {
    id: 'fbrAdmin.hrms.column.employee',
    defaultMessage: 'Employee',
    description: 'HRMS employee table employee column.',
  },
  columnEmployeeCode: {
    id: 'fbrAdmin.hrms.column.employeeCode',
    defaultMessage: 'Employee Code',
    description: 'HRMS employee table employee code column.',
  },
  columnEmployeeId: {
    id: 'fbrAdmin.hrms.column.employeeId',
    defaultMessage: 'Employee ID',
    description: 'HRMS employee table employee ID column.',
  },
  columnCnic: {
    id: 'fbrAdmin.hrms.column.cnic',
    defaultMessage: 'CNIC',
    description: 'HRMS employee table CNIC column.',
  },
  columnPhone: {
    id: 'fbrAdmin.hrms.column.phone',
    defaultMessage: 'Phone',
    description: 'HRMS employee table phone column.',
  },
  columnEmail: {
    id: 'fbrAdmin.hrms.column.email',
    defaultMessage: 'Email Address',
    description: 'HRMS employee table email column.',
  },
  columnAction: {
    id: 'fbrAdmin.hrms.column.action',
    defaultMessage: 'Action',
    description: 'HRMS employee table action column.',
  },
  employeeBadge: {
    id: 'fbrAdmin.hrms.badge.employee',
    defaultMessage: 'Employee',
    description: 'Badge shown beside HRMS employee identities.',
  },
  assignRoleButton: {
    id: 'fbrAdmin.hrms.assignRole',
    defaultMessage: 'Assign Role',
    description: 'Button label to assign an HRMS employee role.',
  },
  assignRoleSuccess: {
    id: 'fbrAdmin.hrms.assignRole.success',
    defaultMessage: 'Role assigned successfully.',
    description: 'Toast shown after assigning an HRMS employee role.',
  },
  assignRoleTitle: {
    id: 'fbrAdmin.hrms.assignRole.title',
    defaultMessage: 'Assign HRMS Role',
    description: 'Title for the HRMS assign-role modal.',
  },
  assignRoleSubtitle: {
    id: 'fbrAdmin.hrms.assignRole.subtitle',
    defaultMessage: 'Create an FBR profile from PayPeople employee information.',
    description: 'Subtitle for the HRMS assign-role modal.',
  },
  assignmentSummary: {
    id: 'fbrAdmin.hrms.assignRole.assignmentSummary',
    defaultMessage: 'This approval will create an FBR profile for {email} and assign the selected role.',
    description: 'Summary shown in the HRMS assign-role modal.',
  },
  assignRoleEyebrow: {
    id: 'fbrAdmin.hrms.assignRole.eyebrow',
    defaultMessage: 'HRMS Assignment',
    description: 'Eyebrow label in the HRMS assign-role modal header.',
  },
  roleLabel: {
    id: 'fbrAdmin.hrms.assignRole.role.label',
    defaultMessage: 'Role',
    description: 'Role field label in the HRMS assign-role modal.',
  },
  rolePlaceholder: {
    id: 'fbrAdmin.hrms.assignRole.role.placeholder',
    defaultMessage: 'Select role...',
    description: 'Role select placeholder in the HRMS assign-role modal.',
  },
  cityLabel: {
    id: 'fbrAdmin.hrms.assignRole.city.label',
    defaultMessage: 'City',
    description: 'City field label in the HRMS assign-role modal.',
  },
  cityPlaceholder: {
    id: 'fbrAdmin.hrms.assignRole.city.placeholder',
    defaultMessage: 'Select city...',
    description: 'City select placeholder in the HRMS assign-role modal.',
  },
  batchLabel: {
    id: 'fbrAdmin.hrms.assignRole.batch.label',
    defaultMessage: 'Batch',
    description: 'Batch field label in the HRMS assign-role modal.',
  },
  batchPlaceholder: {
    id: 'fbrAdmin.hrms.assignRole.batch.placeholder',
    defaultMessage: 'Select batch...',
    description: 'Batch select placeholder in the HRMS assign-role modal.',
  },
  traineeTypeLabel: {
    id: 'fbrAdmin.hrms.assignRole.traineeType.label',
    defaultMessage: 'Trainee Type',
    description: 'Trainee type field label in the HRMS assign-role modal.',
  },
  traineeTypeStp: {
    id: 'fbrAdmin.hrms.assignRole.traineeType.stp',
    defaultMessage: 'STP',
    description: 'STP trainee type option.',
  },
  traineeTypeDstIst: {
    id: 'fbrAdmin.hrms.assignRole.traineeType.dstIst',
    defaultMessage: 'DST / IST',
    description: 'DST/IST trainee type option.',
  },
  batchHintStpOnly: {
    id: 'fbrAdmin.hrms.assignRole.batch.hint',
    defaultMessage: 'Batch is required only for STP trainees.',
    description: 'Hint shown below trainee role assignment options.',
  },
  cityLockedNote: {
    id: 'fbrAdmin.hrms.assignRole.city.locked',
    defaultMessage: 'City will be assigned from your admin profile.',
    description: 'Note shown when city is locked to the caller profile.',
  },
  fieldRequiredError: {
    id: 'fbrAdmin.hrms.assignRole.error.required',
    defaultMessage: 'This field is required.',
    description: 'Required field validation error.',
  },
  noRolesError: {
    id: 'fbrAdmin.hrms.assignRole.error.noRoles',
    defaultMessage: 'You do not have any assignable roles.',
    description: 'Error shown when caller has no creatable roles.',
  },
  noCitiesError: {
    id: 'fbrAdmin.hrms.assignRole.error.noCities',
    defaultMessage: 'No cities are available yet. Add cities before assigning Middle Admin or Data Admin roles.',
    description: 'Error shown when city options are needed but unavailable.',
  },
  noBatchesError: {
    id: 'fbrAdmin.hrms.assignRole.error.noBatches',
    defaultMessage: 'No batches are available yet. Add batches before assigning STP trainee roles.',
    description: 'Error shown when batch options are needed but unavailable.',
  },
  assignRoleError: {
    id: 'fbrAdmin.hrms.assignRole.error.submit',
    defaultMessage: 'Unable to assign role.',
    description: 'Fallback error message when assigning HRMS employee role fails.',
  },
  cancelButton: {
    id: 'fbrAdmin.hrms.assignRole.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button in the HRMS assign-role modal.',
  },
  savingButton: {
    id: 'fbrAdmin.hrms.assignRole.saving',
    defaultMessage: 'Saving...',
    description: 'Submit button label while assigning an HRMS employee role.',
  },
});

export default messages;
