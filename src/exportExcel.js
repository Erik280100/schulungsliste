import { colorOf } from "./components/common.jsx";

// Excel-Datei: Themen als Spaltenköpfe, eingeteilte Trainees als Zeilen, zentriertes X im jeweiligen Thema.
export async function exportExcel(state) {
  const { default: ExcelJS } = await import("exceljs");
  // nur Themen mit eingeteilten Trainees als Spalten
  const themen = state.themen.filter((th) => state.trainees.some((t) => t.status === "anwesend" && t.thema === th));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Einteilung", { views: [{ state: "frozen", xSplit: 2, ySplit: 1 }] });

  const border = { style: "thin", color: { argb: "FFBFC5D2" } };
  const allBorders = { top: border, left: border, bottom: border, right: border };

  ws.columns = [
    { header: "Trainee", width: 24 },
    { header: "Gruppe", width: 22 },
    ...themen.map((t) => ({ header: t, width: Math.max(16, t.length + 4) })),
  ];

  const header = ws.getRow(1);
  header.height = 34;
  header.eachCell((cell, col) => {
    const thema = themen[col - 3];
    const argb = "FF" + (thema ? hex(colorOf(state.themen, thema)) : "1D2330");
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
    cell.alignment = { vertical: "middle", horizontal: col < 3 ? "left" : "center", wrapText: true };
    cell.border = allBorders;
  });

  const rows = state.trainees
    .filter((t) => t.status === "anwesend" && t.thema)
    .sort((a, b) => a.gruppe.localeCompare(b.gruppe) || a.name.localeCompare(b.name));

  rows.forEach((t) => {
    const row = ws.addRow([t.name, t.gruppe, ...themen.map((th) => (th === t.thema ? "X" : ""))]);
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.border = allBorders;
      cell.alignment = { vertical: "middle", horizontal: col < 3 ? "left" : "center" };
      if (col >= 3 && cell.value === "X") cell.font = { bold: true };
    });
  });

  const sum = ws.addRow(["Summe", "", ...themen.map((_, i) => ({ formula: `COUNTIF(${col(i + 3)}2:${col(i + 3)}${rows.length + 1},"X")` }))]);
  sum.eachCell({ includeEmpty: true }, (cell, c) => {
    cell.font = { bold: true };
    cell.border = allBorders;
    cell.alignment = { horizontal: c < 3 ? "left" : "center" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F3F8" } };
  });

  const buf = await wb.xlsx.writeBuffer();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
  );
  a.download = `schulung-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const hex = (c) => c.replace("#", "").toUpperCase();
const col = (n) => String.fromCharCode(64 + n); // reicht für bis zu 26 Spalten
