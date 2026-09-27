/**
 * Converts an array of flat objects into a CSV string.
 * columns: [{ key: 'name', header: 'Member Name' }, ...]
 */
const toCsv = (rows, columns) => {
  const escape = (val) => {
    const str = val === null || val === undefined ? '' : String(val);
    // Quote if it contains a comma, quote, or newline; double any inner quotes.
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escape(c.header)).join(',');
  const lines = rows.map((row) => columns.map((c) => escape(row[c.key])).join(','));

  return [header, ...lines].join('\n');
};

module.exports = { toCsv };
