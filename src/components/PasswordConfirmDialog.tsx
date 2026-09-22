import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function PasswordConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirmed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  onConfirmed: () => void;
}) {
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user.email;
    if (!email) {
      toast.error("Session expired — please log in again");
      return;
    }
    setChecking(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setChecking(false);
    if (error) {
      toast.error("Incorrect password");
      return;
    }
    setPassword("");
    onOpenChange(false);
    onConfirmed();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleConfirm}>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="mt-2 flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          />
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel type="button" onClick={() => setPassword("")}>
              Cancel
            </AlertDialogCancel>
            <Button type="submit" disabled={!password || checking}>
              {checking ? "Verifying..." : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
