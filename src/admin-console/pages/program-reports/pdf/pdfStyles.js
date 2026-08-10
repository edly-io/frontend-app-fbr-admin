import { StyleSheet } from '@react-pdf/renderer';

// React PDF can't read CSS custom properties, so colors are static hex here.
export const PDF_COLORS = {
  textDark: '#1F2933',
  textMuted: '#52606D',
  accent: '#0A3D62',
  border: '#D9DFE4',
  headerBg: '#1F2933',
  headerText: '#FFFFFF',
  zebra: '#F4F6F8',
};

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: PDF_COLORS.textDark,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.accent,
    borderBottomStyle: 'solid',
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: PDF_COLORS.textMuted,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.textDark,
  },
  meta: {
    marginTop: 6,
    fontSize: 9,
    color: PDF_COLORS.textMuted,
  },
  section: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.textDark,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
    borderBottomStyle: 'solid',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    paddingTop: 6,
    fontSize: 8,
    color: PDF_COLORS.textMuted,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    borderTopStyle: 'solid',
  },
});

// `wrap={false}` (applied where these are consumed) keeps a row from
// splitting across a page break, while the table itself still paginates.
export const pdfTableStyles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderStyle: 'solid',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.headerBg,
  },
  headerCell: {
    padding: 8,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.headerText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    borderTopStyle: 'solid',
  },
  rowAlt: {
    backgroundColor: PDF_COLORS.zebra,
  },
  cell: {
    padding: 8,
    fontSize: 9.5,
    color: PDF_COLORS.textDark,
  },
  emptyRow: {
    padding: 10,
    fontSize: 9.5,
    color: PDF_COLORS.textMuted,
    fontStyle: 'italic',
  },
});
