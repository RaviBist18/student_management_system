import * as XLSX from "xlsx";

export type ExportSheet = {
  name: string;
  rows: Record<string, string | number | null>[];
};

function sanitizeSheetName(name: string): string {
  // Excel forbids \ / ? * [ ] : and caps names at 31 chars.
  return name.replace(/[\\/?*[\]:]/g, " ").slice(0, 31);
}

/**
 * Builds a multi-sheet .xlsx in-memory and triggers a browser download.
 * Empty sheets are skipped. Throws if every sheet is empty.
 * No file-system pickers — works in every browser, matches how bulkExport() already downloads CSV.
 */
export async function exportWorkbook(sheets: ExportSheet[], filename: string): Promise<boolean> {
  const usable = sheets.filter((s) => s.rows.length > 0);
  if (usable.length === 0) throw new Error("Nothing to export for this filter.");

  const wb = XLSX.utils.book_new();
  for (const s of usable) {
    const ws = XLSX.utils.json_to_sheet(s.rows);
    const headers = Object.keys(s.rows[0]!);
    ws["!cols"] = headers.map((h) => {
      const longest = s.rows.reduce((m, r) => Math.max(m, String(r[h] ?? "").length), h.length);
      return { wch: Math.min(longest + 4, 50) };
    });
    XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(s.name));
  }

  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  const blob = new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Chrome/Edge: let the user pick where to save. Other browsers: fall back to blind download.
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "Excel file",
            accept: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return false; // user cancelled
      throw err;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
