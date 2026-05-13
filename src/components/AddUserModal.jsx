import React, { useState, useEffect } from 'react';
import { Button, Form } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUserCircle, faHome } from '@fortawesome/free-solid-svg-icons';

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLES_DEF = [
  { id: 'super-admin', label: 'Super Admin', desc: 'Platform-wide' },
  { id: 'middle-admin', label: 'Middle Admin', desc: 'City + programme' },
  { id: 'data-admin', label: 'Data Admin', desc: 'Campus ops' },
  { id: 'instructor', label: 'Instructor', desc: 'Trainer' },
  { id: 'trainee', label: 'Trainee', desc: 'Learner' },
];

const ROLE_CONTEXT = {
  'super-admin': 'Super Admin · platform-wide access',
  'middle-admin': 'Middle Admin · city + programme scope',
  'data-admin': 'Data Admin · campus operations',
  instructor: 'Instructor bio-data (summary)',
  trainee: { stp: 'STP Trainee · BPS-17 probationer (full)', 'dst-ist': 'DST / IST Trainee · serving officer (summary)' },
};

const BPS_GRADES = ['BPS-17', 'BPS-18', 'BPS-19', 'BPS-20', 'BPS-21', 'BPS-22'];
const CITIES = ['Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Rawalpindi', 'All Cities'];
const PROGRAMMES = ['STP', 'DST', 'IST', 'All Programmes'];
const EXPERTISE = ['Inland Revenue', 'Customs & Trade', 'Tax Audit', 'IT & Systems', 'HR & Training'];
const HOSTEL_OPTS = ['Hostel Required', 'Own Accommodation', 'No Preference'];

// ─── Field schema helpers ─────────────────────────────────────────────────────

const F = {
  name: { id: 'name', label: 'NAME', type: 'text', placeholder: 'e.g. Asma Khan', required: true, full: true },
  cnic: { id: 'cnic', label: 'CNIC', type: 'text', placeholder: '00000-0000000-0', helper: '13-digit national identity number', required: true },
  designation: { id: 'designation', label: 'DESIGNATION', type: 'text', placeholder: 'e.g. Assistant Commissioner IR', required: true },
  bpsGrade: { id: 'bpsGrade', label: 'BPS GRADE', type: 'select', placeholder: 'Select grade...', options: BPS_GRADES, required: true },
  cityScope: { id: 'cityScope', label: 'CITY SCOPE', type: 'select', placeholder: 'Select city...', options: CITIES, required: true },
  programmeScope: { id: 'programmeScope', label: 'PROGRAMME SCOPE', type: 'select', placeholder: 'Select...', options: PROGRAMMES, required: true },
  mobile: { id: 'mobile', label: 'MOBILE', type: 'tel', placeholder: '+92  3XX  XXXXXXX', required: true },
  email: { id: 'email', label: 'EMAIL', type: 'email', placeholder: 'name@fbr.gov.pk', required: true },
  education: { id: 'education', label: 'EDUCATION', type: 'text', placeholder: 'Degree, institute, year', required: true },
  fieldOfExpertise: { id: 'fieldOfExpertise', label: 'FIELD OF EXPERTISE', type: 'select', placeholder: 'Select expertise...', options: EXPERTISE, required: true },
  fieldOrganisation: { id: 'fieldOrganisation', label: 'FIELD ORGANISATION', type: 'text', placeholder: 'e.g. RTO Lahore / FBR Training Academy', helper: 'Parent posting / institution', required: true },
  dateOfBirth: { id: 'dateOfBirth', label: 'DATE OF BIRTH', type: 'date', required: true },
  serviceHistory: { id: 'serviceHistory', label: 'SERVICE HISTORY (POSTINGS)', type: 'textarea', placeholder: 'e.g. ITP Lahore (2023–24), RTO Karachi (2024–present)' },
  hostelAccommodation: { id: 'hostelAccommodation', label: 'HOSTEL / ACCOMMODATION', type: 'select', placeholder: 'Select preference...', options: HOSTEL_OPTS, required: true },
  emergencyContact: { id: 'emergencyContact', label: 'EMERGENCY CONTACT', type: 'text', placeholder: 'Name, relation, phone', required: true },
  photo: { id: 'photo', label: 'PHOTO', type: 'file', helper: 'Passport-size, JPG/PNG. Auto-resized; EXIF stripped.', required: true, full: true },
};

const getLayout = (roleId, programmeType) => {
  switch (roleId) {
    case 'super-admin':
    case 'middle-admin':
      return {
        main: [
          [F.name],
          [F.cnic, F.designation],
          [F.bpsGrade, F.cityScope],
          [F.programmeScope, F.mobile],
          [F.email],
        ],
      };
    case 'data-admin':
      return {
        main: [
          [F.name],
          [F.cnic, F.designation],
          [F.bpsGrade, F.cityScope],
          [F.mobile, F.email],
        ],
      };
    case 'instructor':
      return {
        main: [
          [F.name],
          [F.cnic, { ...F.education, helper: undefined }],
          [F.fieldOfExpertise, F.fieldOrganisation],
          [F.mobile, F.email],
        ],
      };
    case 'trainee':
      if (programmeType === 'stp') {
        return {
          main: [
            [F.name],
            [F.cnic, F.dateOfBirth],
            [{ ...F.education, helper: 'Full — degree, institute, year, distinctions' }, F.designation],
            [F.bpsGrade, { ...F.fieldOrganisation, label: 'FIELD ORGANISATION (PARENT POSTING)', helper: 'Posting before STP' }],
            [F.mobile, F.email],
          ],
          residential: [
            [F.serviceHistory],
            [F.hostelAccommodation, F.emergencyContact],
            [F.photo],
          ],
        };
      }
      return {
        main: [
          [F.name],
          [F.cnic, F.dateOfBirth],
          [{ ...F.education, helper: 'Summary (degree, institute, year)' }, F.designation],
          [F.bpsGrade, { ...F.fieldOrganisation, label: 'FIELD ORGANISATION', helper: 'Current posting' }],
          [F.mobile, F.email],
        ],
        residential: [
          [F.emergencyContact],
        ],
      };
    default:
      return { main: [] };
  }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldRow = ({ fields, values, onChange, errors }) => (
  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
    {fields.map(field => {
      const err = errors[field.id];
      let input;
      if (field.type === 'select') {
        input = (
          <Form.Control
            as="select"
            value={values[field.id] || ''}
            onChange={e => onChange(field.id, e.target.value)}
            isInvalid={!!err}
          >
            <option value="">{field.placeholder}</option>
            {field.options.map(o => <option key={o} value={o}>{o}</option>)}
          </Form.Control>
        );
      } else if (field.type === 'textarea') {
        input = (
          <Form.Control
            as="textarea"
            value={values[field.id] || ''}
            onChange={e => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            isInvalid={!!err}
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        );
      } else if (field.type === 'file') {
        input = (
          <Form.Control
            type="file"
            accept="image/jpeg,image/png"
            onChange={e => onChange(field.id, e.target.files[0])}
            isInvalid={!!err}
          />
        );
      } else {
        input = (
          <Form.Control
            type={field.type}
            value={values[field.id] || ''}
            onChange={e => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            isInvalid={!!err}
          />
        );
      }
      return (
        <Form.Group key={field.id} style={{ flex: field.full ? '0 0 100%' : 1, minWidth: 0, marginBottom: 0 }}>
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

const SectionHeader = ({ icon, title, note }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 16px', borderTop: '1px solid var(--pgn-color-border)', paddingTop: '18px' }}>
    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#2A6496', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <FontAwesomeIcon icon={icon} style={{ fontSize: '12px' }} />
      {title}
    </span>
    {note && <span style={{ fontSize: '12px', color: 'var(--pgn-color-text-light)' }}>{note}</span>}
  </div>
);

// ─── Main modal component ─────────────────────────────────────────────────────

const AddUserModal = ({ onClose, editUser = null, onSubmit }) => {
  const isEdit = !!editUser;

  const roleFromUser = (user) => {
    if (!user) return 'super-admin';
    const map = { 'Super Admin': 'super-admin', 'Middle Admin': 'middle-admin', 'Data Admin': 'data-admin', Instructor: 'instructor', Trainee: 'trainee' };
    return map[user.role] || 'super-admin';
  };

  const [selectedRole, setSelectedRole] = useState(isEdit ? roleFromUser(editUser) : 'super-admin');
  const [programmeType, setProgrammeType] = useState('stp');
  const [values, setValues] = useState(isEdit ? { ...editUser } : {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) setValues({});
  }, [selectedRole, programmeType]);

  const handleChange = (id, val) => {
    setValues(prev => ({ ...prev, [id]: val }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }));
  };

  const handleSubmit = () => {
    const layout = getLayout(selectedRole, programmeType);
    const allRows = [...(layout.main || []), ...(layout.residential || [])];
    const newErrors = {};
    allRows.flat().forEach(field => {
      if (field.required && !values[field.id]) {
        newErrors[field.id] = 'This field is required';
      }
    });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    if (onSubmit) onSubmit({ ...values, role: ROLES_DEF.find(r => r.id === selectedRole)?.label });
    onClose();
  };

  const layout = getLayout(selectedRole, programmeType);
  const contextText = selectedRole === 'trainee'
    ? ROLE_CONTEXT.trainee[programmeType]
    : ROLE_CONTEXT[selectedRole];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: '12px', width: '840px', maxWidth: '96vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #1E4976 100%)', padding: '22px 28px', borderBottom: '3px solid #C9922A', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '20px', flexShrink: 0 }}>
            +
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {isEdit ? 'EDIT RECORD' : 'NEW RECORD'}
            </p>
            <h2 style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: 700, color: '#fff' }}>
              {isEdit ? 'Edit User' : 'Add User'}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
              {isEdit ? 'Update account details and role assignment' : 'Create a new account and assign a role'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ position: 'absolute', top: '18px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', color: '#fff', width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px' }}>

          {/* Role selector — hidden in edit mode (role is fixed) */}
          {!isEdit ? (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-text-light)', letterSpacing: '0.07em', display: 'block', marginBottom: '8px' }}>
                ROLE <span style={{ color: '#E53E3E' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {ROLES_DEF.map(r => {
                  const active = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      style={{
                        flex: 1, padding: '10px 8px', borderRadius: '8px', cursor: 'pointer',
                        border: `1.5px solid ${active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-border)'}`,
                        background: active ? 'var(--pgn-color-primary-light)' : '#fff',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-gray-900)' }}>{r.label}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-text-light)' }}>{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-text-light)', letterSpacing: '0.07em' }}>ROLE</span>
              {(() => {
                const r = ROLES_DEF.find(x => x.id === selectedRole);
                return (
                  <span style={{ background: 'var(--pgn-color-primary-light)', color: 'var(--pgn-color-primary-base)', border: '1.5px solid var(--pgn-color-primary-base)', padding: '4px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                    {r?.label}
                    <span style={{ fontWeight: 400, fontSize: '11px', marginLeft: '6px', opacity: 0.75 }}>{r?.desc}</span>
                  </span>
                );
              })()}
            </div>
          )}

          {/* Programme type selector (Trainee only) */}
          {selectedRole === 'trainee' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-text-light)', letterSpacing: '0.07em', display: 'block', marginBottom: '8px' }}>
                PROGRAMME TYPE <span style={{ color: '#E53E3E' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { id: 'stp', label: 'STP', desc: 'Specialised, residential (full bio-data)' },
                  { id: 'dst-ist', label: 'DST / IST', desc: 'Domain / In-Service (summary bio-data)' },
                ].map(p => {
                  const active = programmeType === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProgrammeType(p.id)}
                      style={{
                        flex: 1, padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                        border: `1.5px solid ${active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-border)'}`,
                        background: active ? 'var(--pgn-color-primary-light)' : '#fff', textAlign: 'center',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-gray-900)' }}>{p.label}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '12px', color: active ? 'var(--pgn-color-primary-base)' : 'var(--pgn-color-text-light)' }}>{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Information section */}
          <SectionHeader icon={faUserCircle} title="INFORMATION" note={contextText} />
          {(layout.main || []).map((row, i) => (
            <FieldRow key={i} fields={row} values={values} onChange={handleChange} errors={errors} />
          ))}

          {/* Residential section */}
          {layout.residential && (
            <>
              <SectionHeader icon={faHome} title="STP RESIDENTIAL DETAILS" note="Required for STP probationers" />
              {layout.residential.map((row, i) => (
                <FieldRow key={i} fields={row} values={values} onChange={handleChange} errors={errors} />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--pgn-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#fff', flexShrink: 0 }}>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px', marginRight: '7px' }} />
            {isEdit ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
