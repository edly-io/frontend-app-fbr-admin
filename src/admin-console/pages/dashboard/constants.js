import {
  Assessment, Groups, School, StarFilled, TaskAlt, WorkspacePremium,
} from '@openedx/paragon/icons';
import { RATING_IDS } from './data/mockData';

/**
 * Chart and meter colours. These are consumed as values by both chart props and
 * inline styles, so they live here rather than in the stylesheet. Each is a
 * Paragon ramp step where one exists; the rest clear WCAG 3:1 against the white
 * card surface. The amber is the one already used by `report-stat-card--accent-2`.
 */
export const TONE_COLORS = {
  positive: '#178253', // --pgn-color-success-500
  negative: '#C32D3A', // --pgn-color-danger-500
  caution: '#B45309', // amber, shared with the reports stat cards
  neutral: '#707070', // --pgn-color-gray-500
  info: '#006DAA', // --pgn-color-info-500
  navy: '#0A3055', // --pgn-color-primary-500
  teal: '#0F7A6B',
  violet: '#5A32A3',
};

/** Tints of `TONE_COLORS`, used behind icons and status chips. */
export const TONE_SURFACES = {
  positive: '#F1F8F5', // --pgn-color-success-100
  negative: '#FBF2F3', // --pgn-color-danger-100
  caution: '#FDF6E8',
  info: '#F0F6FA', // --pgn-color-info-100
  navy: '#EEF2F7',
  teal: '#EDF6F4',
  violet: '#F3F0FA',
};

/**
 * Role identifiers as the backend reports them (`FbrProfileRole`), so the
 * `/dashboard/users/` response keys straight into the colour scales below.
 */
export const ROLE_IDS = {
  superAdmin: 'super_admin',
  middleAdmin: 'middle_admin',
  dataAdmin: 'data_admin',
  instructor: 'instructor',
  trainee: 'trainee',
};

/**
 * The dashboard's only categorical scale, so these five were checked for
 * colour-vision separation: worst adjacent pair dE 10.5 under simulated
 * protanopia, 15.3 unsimulated. Re-step them together, not individually.
 */
export const ROLE_COLORS = {
  [ROLE_IDS.superAdmin]: '#A82D26',
  [ROLE_IDS.middleAdmin]: '#9B2C8A',
  [ROLE_IDS.dataAdmin]: '#1D6FE0',
  [ROLE_IDS.instructor]: '#0E9B7E',
  [ROLE_IDS.trainee]: '#B08A0C',
};

/**
 * Light-mode surfaces for the role cards, one tint per hue in `ROLE_COLORS`.
 * Reached through the `--dashboard-role-surface` custom property rather than a
 * background declaration, so the dark variant can swap the surface out.
 */
export const ROLE_SURFACES = {
  [ROLE_IDS.superAdmin]: '#F8EEEE',
  [ROLE_IDS.middleAdmin]: '#F7EEF6',
  [ROLE_IDS.dataAdmin]: '#EDF3FD',
  [ROLE_IDS.instructor]: '#ECF7F5',
  [ROLE_IDS.trainee]: '#F9F6EC',
};

/** Fallback for a role the backend adds before the frontend knows about it. */
export const DEFAULT_ROLE_COLOR = TONE_COLORS.neutral;
export const DEFAULT_ROLE_SURFACE = '#F2F2F2';

/** Ordered the way they stack in the breakdown bar. */
export const ATTENDANCE_COLORS = {
  present: TONE_COLORS.positive,
  absent: TONE_COLORS.negative,
  onLeave: TONE_COLORS.caution,
};

/** Ordinal, best to worst. */
export const RATING_COLORS = {
  [RATING_IDS.excellent]: '#126842', // --pgn-color-success-700
  [RATING_IDS.veryGood]: '#178253', // --pgn-color-success-500
  [RATING_IDS.good]: TONE_COLORS.neutral,
  [RATING_IDS.fair]: TONE_COLORS.caution,
  [RATING_IDS.poor]: TONE_COLORS.negative,
};

/** Ordered best-to-worst; the first matching band wins. */
export const ATTENDANCE_BANDS = [
  { minimum: 75, color: TONE_COLORS.positive },
  { minimum: 55, color: TONE_COLORS.caution },
  { minimum: 0, color: TONE_COLORS.negative },
];

export const getAttendanceBandColor = percentage => (
  ATTENDANCE_BANDS.find(band => percentage >= band.minimum) || ATTENDANCE_BANDS[0]
).color;

/** Faculty rating is collected as a 1-5 star rating. */
export const FACULTY_RATING_MAXIMUM = 5;

/**
 * The six Program performance tiles, in the order `GET /dashboard/kpis/`
 * documents them. `tone` picks both the icon colour and the card's left accent
 * out of `TONE_COLORS`/`TONE_SURFACES`, so a tile is recoloured in one place.
 */
export const KPI_TILES = [
  { id: 'activePrograms', icon: School, tone: 'info' },
  { id: 'enrolledTrainees', icon: Groups, tone: 'navy' },
  { id: 'overallCompletion', icon: TaskAlt, tone: 'positive' },
  { id: 'averageScore', icon: Assessment, tone: 'caution' },
  { id: 'certificatesIssued', icon: WorkspacePremium, tone: 'teal' },
  { id: 'facultyRating', icon: StarFilled, tone: 'violet' },
];
