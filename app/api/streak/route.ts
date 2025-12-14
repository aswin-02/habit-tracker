import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Return the authoritative streak for the signed-in user
export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Reuse the same logic as dashboard page to compute streak
  // 1. Get active habits count
  const { data: habits } = await supabase
    .from("habits")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true);

  const totalHabits = habits?.length ?? 0;
  if (totalHabits === 0) return NextResponse.json({ streak: 0 });

  // 2. Get all habit logs ordered by date desc
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("log_date, completed")
    .eq("user_id", userId)
    .order("log_date", { ascending: false });

  if (!logs || logs.length === 0) return NextResponse.json({ streak: 0 });

  // 3. Group logs by date and count completed per day
  const logsByDate: Record<string, number> = {};

  for (const log of logs) {
    if (!logsByDate[log.log_date]) logsByDate[log.log_date] = 0;
    if (log.completed) logsByDate[log.log_date]++;
  }

  // 4. Compute streak based on consecutive full-completion days
  //    - Count consecutive full days starting from yesterday backwards
  //    - If today is fully completed, include it on top
  let streak = 0;

  const formatDate = (d: Date) => d.toISOString().slice(0, 10);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  let cursor = new Date(yesterday);

  while (true) {
    const dateKey = formatDate(cursor);
    const completedCount = logsByDate[dateKey] ?? 0;

    if (completedCount === totalHabits) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  const todayKey = formatDate(new Date());
  const todayCompleted = (logsByDate[todayKey] ?? 0) === totalHabits;
  if (todayCompleted) streak = streak + 1;

  return NextResponse.json({ streak });
}
