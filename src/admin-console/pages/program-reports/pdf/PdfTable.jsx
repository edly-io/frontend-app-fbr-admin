import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from '@react-pdf/renderer';
import { pdfTableStyles } from './pdfStyles';

const PdfTable = ({ columns, data, emptyText }) => (
  <View style={pdfTableStyles.table}>
    <View style={pdfTableStyles.headerRow} wrap={false}>
      {columns.map(column => (
        <Text
          key={column.key}
          style={[pdfTableStyles.headerCell, { flex: column.flex || 1 }]}
        >
          {column.header}
        </Text>
      ))}
    </View>

    {data.length === 0 ? (
      <Text style={pdfTableStyles.emptyRow}>{emptyText}</Text>
    ) : data.map((row, index) => (
      <View
        key={row.id}
        wrap={false}
        style={[pdfTableStyles.row, index % 2 === 1 ? pdfTableStyles.rowAlt : undefined]}
      >
        {columns.map(column => (
          <Text
            key={column.key}
            style={[pdfTableStyles.cell, { flex: column.flex || 1 }]}
          >
            {row[column.key]}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

PdfTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    flex: PropTypes.number,
  })).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  })).isRequired,
  emptyText: PropTypes.string.isRequired,
};

export default PdfTable;
