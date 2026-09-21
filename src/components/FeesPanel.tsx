import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Student, Payment } from "@/lib/types";
import { totalDue, totalPaid, balanceDue, feeStatus } from "@/lib/helpers";
import { BSDatePicker } from "@/components/BSDatePicker";

export function FeesPanel({
  student,
  onAddPayment,
}: {
  student: Student;
  onAddPayment: (payment: Omit<Payment, "id">) => void;
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [mode, setMode] = useState("Cash");
  const [note, setNote] = useState("");
  const due = totalDue(student);
  const paid = totalPaid(student);
  const balance = balanceDue(student);
  const status = feeStatus(student);
  const statusTone =
    status === "Paid" ? "excellent" : status === "Partial" ? "average" : "attention";

  function submit(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0 || !date) {
      toast.error("Enter a valid amount and date");
      return;
    }
    onAddPayment({ amount: value, date, mode, ...(note ? { note } : {}) });
    setAmount("");
    setDate("");
    setNote("");
  }

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="data-tile">
          <span>Admission fee</span>
          <strong>Rs. {student.admissionFee.toLocaleString()}</strong>
        </div>
        <div className="data-tile">
          <span>Course fee</span>
          <strong>Rs. {student.courseFee.toLocaleString()}</strong>
        </div>
        <div className="data-tile">
          <span>Total paid</span>
          <strong>Rs. {paid.toLocaleString()}</strong>
        </div>
        <div className="data-tile">
          <span>Balance due</span>
          <strong className={balance > 0 ? "text-danger" : "text-success"}>
            Rs. {balance.toLocaleString()}
          </strong>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Fee status:</span>
        <span className={`score-badge ${statusTone}`}>{status}</span>
      </div>

      <form
        className="mb-8 grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-4"
        onSubmit={submit}
      >
        <label className="form-field">
          <span>Amount (Rs.)</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 10000"
          />
        </label>
        <label className="form-field">
          <span>Date (B.S.)</span>
          <BSDatePicker value={date} onChange={setDate} />
        </label>
        <label className="form-field">
          <span>Mode</span>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="eSewa">eSewa</SelectItem>
              <SelectItem value="Khalti">Khalti</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="form-field">
          <span>Note (optional)</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. 2nd installment"
          />
        </label>
        <div className="sm:col-span-4">
          <Button type="submit">
            <Plus /> Record Payment
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="exam-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Mode</th>
              <th>Note</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {student.payments.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted-foreground">
                  No payments recorded yet
                </td>
              </tr>
            )}
            {student.payments.map((p) => (
              <tr key={p.id}>
                <td>{p.date}</td>
                <td>{p.mode}</td>
                <td className="text-muted-foreground">{p.note ?? "—"}</td>
                <td className="font-mono font-bold">Rs. {p.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
