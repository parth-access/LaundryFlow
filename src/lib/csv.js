// OWNER: Dhruv. Small CSV writer for the unpaid fines export.
// Every cell is quoted and inner quotes are doubled, so names with commas stay in one column.
// Cells starting with = + - @ get a leading ' so Excel does not run them as formulas.

function cell(value) {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** @param {string[]} header @param {unknown[][]} rows */
export function toCsv(header, rows) {
  return [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}
