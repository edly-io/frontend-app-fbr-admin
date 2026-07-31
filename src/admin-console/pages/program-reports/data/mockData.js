/**
 * Static sample data for the Program Report page.
 *
 * This is UI-only (no backend integration - see task constraints): the shape
 * below mirrors what a real programs-reporting API would eventually return,
 * so swapping this module for a React Query data layer later is a drop-in
 * replacement rather than a rewrite. Each program carries a list of
 * instructors, a list of trainees who were awarded a certificate, and a
 * lifecycle `status` (Active, Draft, Archived or Freezed).
 */

const INSTRUCTORS = {
  ayeshaKhan: {
    id: 'instr-ayesha-khan',
    name: 'Ayesha Khan',
    email: 'ayesha.khan@fbr.gov.pk',
    avatarValue: 'https://i.pravatar.cc/150?img=32',
  },
  bilalAhmed: {
    id: 'instr-bilal-ahmed',
    name: 'Bilal Ahmed',
    email: 'bilal.ahmed@fbr.gov.pk',
  },
  sanaMalik: {
    id: 'instr-sana-malik',
    name: 'Sana Malik',
    email: 'sana.malik@fbr.gov.pk',
    avatarValue: 'https://i.pravatar.cc/150?img=47',
  },
  usmanRaza: {
    id: 'instr-usman-raza',
    name: 'Usman Raza',
    email: 'usman.raza@fbr.gov.pk',
  },
  hinaSheikh: {
    id: 'instr-hina-sheikh',
    name: 'Hina Sheikh',
    email: 'hina.sheikh@fbr.gov.pk',
    avatarValue: 'https://i.pravatar.cc/150?img=45',
  },
  kamranIqbal: {
    id: 'instr-kamran-iqbal',
    name: 'Kamran Iqbal',
    email: 'kamran.iqbal@fbr.gov.pk',
  },
  faisalDar: {
    id: 'instr-faisal-dar',
    name: 'Faisal Dar',
    email: 'faisal.dar@fbr.gov.pk',
  },
  nadiaAslam: {
    id: 'instr-nadia-aslam',
    name: 'Nadia Aslam',
    email: 'nadia.aslam@fbr.gov.pk',
  },
};

const TRAINEES = {
  hassanTariq: {
    id: 'trainee-hassan-tariq',
    name: 'Hassan Tariq',
    email: 'hassan.tariq@fbr.gov.pk',
    avatarValue: 'https://i.pravatar.cc/150?img=12',
  },
  mariumFarooq: {
    id: 'trainee-marium-farooq',
    name: 'Marium Farooq',
    email: 'marium.farooq@fbr.gov.pk',
  },
  zainAbbas: {
    id: 'trainee-zain-abbas',
    name: 'Zain Abbas',
    email: 'zain.abbas@fbr.gov.pk',
    avatarValue: 'https://i.pravatar.cc/150?img=15',
  },
  ramshaJaved: {
    id: 'trainee-ramsha-javed',
    name: 'Ramsha Javed',
    email: 'ramsha.javed@fbr.gov.pk',
  },
  omerFarooqi: {
    id: 'trainee-omer-farooqi',
    name: 'Omer Farooqi',
    email: 'omer.farooqi@fbr.gov.pk',
  },
  sadiaNoor: {
    id: 'trainee-sadia-noor',
    name: 'Sadia Noor',
    email: 'sadia.noor@fbr.gov.pk',
    avatarValue: 'https://i.pravatar.cc/150?img=25',
  },
  waqasShah: {
    id: 'trainee-waqas-shah',
    name: 'Waqas Shah',
    email: 'waqas.shah@fbr.gov.pk',
  },
  aliyaHassan: {
    id: 'trainee-aliya-hassan',
    name: 'Aliya Hassan',
    email: 'aliya.hassan@fbr.gov.pk',
  },
};

const PROGRAMS = [
  {
    id: 'prog-income-tax',
    name: 'Income Tax Assessment Fundamentals',
    city: 'Islamabad',
    instructors: [INSTRUCTORS.ayeshaKhan, INSTRUCTORS.kamranIqbal],
    certificates: [TRAINEES.hassanTariq, TRAINEES.mariumFarooq, TRAINEES.zainAbbas],
    enrolled: 32,
    completed: 24,
    avgScore: 82,
    avgAttendance: 90,
    status: 'Active',
  },
  {
    id: 'prog-customs-valuation',
    name: 'Customs Valuation & Classification',
    city: 'Karachi',
    instructors: [INSTRUCTORS.bilalAhmed, INSTRUCTORS.faisalDar],
    certificates: [TRAINEES.ramshaJaved],
    enrolled: 24,
    completed: 15,
    avgScore: 76,
    avgAttendance: 82,
    status: 'Freezed',
  },
  {
    id: 'prog-sales-tax-audit',
    name: 'Sales Tax Audit Procedures',
    city: 'Lahore',
    instructors: [INSTRUCTORS.sanaMalik, INSTRUCTORS.nadiaAslam],
    certificates: [TRAINEES.omerFarooqi, TRAINEES.sadiaNoor],
    enrolled: 28,
    completed: 18,
    avgScore: 79,
    avgAttendance: 88,
    status: 'Active',
  },
  {
    id: 'prog-aml-essentials',
    name: 'Anti-Money Laundering Essentials',
    city: 'Islamabad',
    instructors: [INSTRUCTORS.usmanRaza],
    certificates: [],
    enrolled: 20,
    completed: 17,
    avgScore: 88,
    avgAttendance: 95,
    status: 'Draft',
  },
  {
    id: 'prog-digital-filing',
    name: 'Digital Filing (IRIS) Systems',
    city: 'Karachi',
    instructors: [INSTRUCTORS.hinaSheikh],
    certificates: [TRAINEES.waqasShah, TRAINEES.aliyaHassan],
    enrolled: 26,
    completed: 12,
    avgScore: 71,
    avgAttendance: 74,
    status: 'Archived',
  },
  {
    id: 'prog-taxpayer-ethics',
    name: 'Taxpayer Facilitation & Ethics',
    city: 'Lahore',
    instructors: [INSTRUCTORS.kamranIqbal, INSTRUCTORS.ayeshaKhan, INSTRUCTORS.sanaMalik],
    certificates: [
      TRAINEES.hassanTariq, TRAINEES.sadiaNoor, TRAINEES.waqasShah, TRAINEES.mariumFarooq,
    ],
    enrolled: 18,
    completed: 14,
    avgScore: 84,
    avgAttendance: 91,
    status: 'Active',
  },
];

const matchesProgramFilter = (row, filters) => (
  filters.program === 'all' || row.program === filters.program
);

const matchesInstructorFilter = (row, filters) => (
  filters.instructor === 'all'
  || row.instructors.some(instructor => instructor.name === filters.instructor)
);

const matchesCityFilter = (row, filters) => (
  filters.city === 'all' || row.city === filters.city
);

/**
 * Builds the Program Report rows + summary stat tuples for the given
 * Program/Instructor/City filter selection.
 */
export const buildProgramReportData = (filters) => {
  const rows = PROGRAMS
    .map(program => ({
      id: program.id,
      program: program.name,
      city: program.city,
      instructors: program.instructors,
      certificates: program.certificates,
      enrolled: program.enrolled,
      completed: program.completed,
      avgScore: program.avgScore,
      avgAttendance: program.avgAttendance,
      status: program.status,
    }))
    .filter(row => (
      matchesProgramFilter(row, filters)
      && matchesInstructorFilter(row, filters)
      && matchesCityFilter(row, filters)
    ));

  const certificatesAwarded = rows.reduce((total, row) => total + row.certificates.length, 0);
  const avgAttendance = rows.length
    ? Math.round(rows.reduce((total, row) => total + row.avgAttendance, 0) / rows.length)
    : 0;

  return {
    rows,
    stats: [
      ['programCount', rows.length],
      ['certificatesAwarded', certificatesAwarded],
      ['avgAttendance', `${avgAttendance}%`],
    ],
  };
};

export const getFilterOptionLists = () => ({
  programs: PROGRAMS.map(program => program.name),
  instructors: [...new Set(PROGRAMS.flatMap(
    program => program.instructors.map(instructor => instructor.name),
  ))],
  cities: [...new Set(PROGRAMS.map(program => program.city))],
});
