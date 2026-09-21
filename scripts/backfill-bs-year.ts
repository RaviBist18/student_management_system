import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { toBik_euro } from "bikram-sambat";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function run() {
  // ...rest stays same
  const { data: students, error } = await supabase.from("students").select("id, created_at");

  if (error) throw error;

  for (const s of students!) {
    const adDate = new Date(s.created_at).toISOString().split("T")[0]; // YYYY-MM-DD
    const bsDate = toBik_euro(adDate); // e.g. "2083-06-05"
    const bsYear = parseInt(bsDate.split("-")[0], 10);

    const { error: updErr } = await supabase
      .from("students")
      .update({ bs_year: bsYear })
      .eq("id", s.id);

    if (updErr) console.error(`Failed ${s.id}:`, updErr);
    else console.log(`${s.id} → bs_year ${bsYear}`);
  }
}

run();
