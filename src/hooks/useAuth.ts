import { useEffect, useState } from "react";
import { supabase, ALLOWED_EMAIL } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      handleSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      handleSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  function handleSession(s: Session | null) {
    if (s && s.user.email !== ALLOWED_EMAIL) {
      supabase.auth.signOut();
      setSession(null);
    } else {
      setSession(s);
    }
  }

  return { session, loading, isAuthed: !!session };
}
