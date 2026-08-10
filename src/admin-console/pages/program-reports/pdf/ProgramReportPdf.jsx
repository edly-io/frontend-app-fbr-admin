import React from 'react';
import PropTypes from 'prop-types';
import {
  Document, Page, View, Text,
} from '@react-pdf/renderer';
import PdfTable from './PdfTable';
import { pdfStyles } from './pdfStyles';

const PEOPLE_COLUMNS = [
  { key: 'name', header: 'Full Name', flex: 1.6 },
  { key: 'role', header: 'Role', flex: 1 },
];

const ProgramReportPdf = ({
  programName,
  city,
  instructors,
  certificates,
  generatedOn,
  instructorsEmptyText,
  certificatesEmptyText,
}) => (
  <Document title={programName}>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.eyebrow}>Program Report</Text>
        <Text style={pdfStyles.title}>{programName}</Text>
        <Text style={pdfStyles.meta}>{city} &middot; Generated on {generatedOn}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionHeading}>Instructors</Text>
        <PdfTable columns={PEOPLE_COLUMNS} data={instructors} emptyText={instructorsEmptyText} />
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionHeading}>Certificates Awarded</Text>
        <PdfTable columns={PEOPLE_COLUMNS} data={certificates} emptyText={certificatesEmptyText} />
      </View>

      <Text
        style={pdfStyles.footer}
        // eslint-disable-next-line react/no-unstable-nested-components
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

const personShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  role: PropTypes.string,
});

ProgramReportPdf.propTypes = {
  programName: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  instructors: PropTypes.arrayOf(personShape).isRequired,
  certificates: PropTypes.arrayOf(personShape).isRequired,
  generatedOn: PropTypes.string.isRequired,
  instructorsEmptyText: PropTypes.string.isRequired,
  certificatesEmptyText: PropTypes.string.isRequired,
};

export default ProgramReportPdf;
