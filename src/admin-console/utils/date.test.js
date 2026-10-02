import {
  formatDate, formatCalendarDate, formatTime, formatDateTime,
} from './date';

describe('date display helpers', () => {
  // A local afternoon, so the expectations hold in any test time zone.
  const afternoon = new Date(2026, 8, 21, 16, 33, 30);

  it('formats dates day first as DD/MM/YYYY', () => {
    expect(formatDate(afternoon)).toBe('21/09/2026');
    expect(formatDate(new Date(2027, 3, 5))).toBe('05/04/2027');
  });

  it('keeps a bare YYYY-MM-DD on its calendar day', () => {
    expect(formatDate('2026-12-26')).toBe('26/12/2026');
    expect(formatDate('2026-01-03')).toBe('03/01/2026');
  });

  it('formats ISO timestamps', () => {
    const iso = afternoon.toISOString();
    expect(formatDate(iso)).toBe('21/09/2026');
    expect(formatDateTime(iso)).toBe('21/09/2026, 4:33:30 PM');
  });

  it('uses a 12-hour clock, with seconds only when asked', () => {
    expect(formatTime(afternoon)).toBe('4:33 PM');
    expect(formatTime(afternoon, { seconds: true })).toBe('4:33:30 PM');
    expect(formatTime(new Date(2026, 8, 21, 0, 5))).toBe('12:05 AM');
    expect(formatDateTime(afternoon, { seconds: false })).toBe('21/09/2026, 4:33 PM');
  });

  it('reads a timestamp that stands for a calendar day by its date part only', () => {
    // End-of-day UTC is the next morning in Pakistan (UTC+5); the day shown must not move.
    expect(formatCalendarDate('2026-12-26T23:59:59Z')).toBe('26/12/2026');
    expect(formatCalendarDate('2026-12-26')).toBe('26/12/2026');
    expect(formatCalendarDate('')).toBe('');
  });

  it('returns an empty string for empty input and echoes unparseable strings', () => {
    [formatDate, formatCalendarDate, formatTime, formatDateTime].forEach((format) => {
      expect(format('')).toBe('');
      expect(format(null)).toBe('');
      expect(format(undefined)).toBe('');
      expect(format('not a date')).toBe('not a date');
    });
  });
});
