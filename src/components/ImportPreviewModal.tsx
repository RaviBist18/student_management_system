import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ImportRow } from "@/lib/types";

export function ImportPreviewModal({
  open,
  onOpenChange,
  rows,
  onCommit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rows: ImportRow[];
  onCommit: (rows: ImportRow[]) => void;
}) {
  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const invalidCount = rows.length - validCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto bg-card p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>CSV Import Preview</DialogTitle>
          <DialogDescription>
            {rows.length} row(s) found · {validCount} valid · {invalidCount} with errors
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <table className="exam-table">
            <thead>
              <tr>
                <th>Row</th>
                <th>Name</th>
                <th>Student ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.rowNum}>
                  <td>{r.rowNum}</td>
                  <td>{r.raw["name"] || "—"}</td>
                  <td className="font-mono">{r.raw["id"] || "—"}</td>
                  <td>
                    {r.errors.length === 0 ? (
                      <span className="score-badge excellent">Valid</span>
                    ) : (
                      <span className="score-badge attention" title={r.errors.join("; ")}>
                        {r.errors.length} error(s)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invalidCount > 0 && (
            <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
              {rows
                .filter((r) => r.errors.length > 0)
                .map((r) => (
                  <p key={r.rowNum}>
                    Row {r.rowNum}: {r.errors.join("; ")}
                  </p>
                ))}
            </div>
          )}
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={validCount === 0} onClick={() => onCommit(rows)}>
            <Check /> Import {validCount} Valid Row(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
