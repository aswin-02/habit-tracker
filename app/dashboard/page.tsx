export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DashboardContent from "./dashboard-content";

export default async function Dashboard() {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: habits, error } = await supabase
    .from("habits")
    .select("id, title")
    .eq("user_id", session.user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const today = new Date().toISOString().slice(0, 10);

  const { data: logs, error: logsError } = await supabase
    .from("habit_logs")
    .select("habit_id, completed")
    .eq("user_id", session.user.id)
    .eq("log_date", today);

  if (logsError) throw new Error(logsError.message);

  async function getCurrentStreak(
    supabase: ReturnType<
      typeof import("@/lib/supabase-server").createSupabaseServerClient
    >,
    userId: string
  ) {
    // 1. Get active habits count
    const { data: habits } = await supabase
      .from("habits")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true);

    const totalHabits = habits?.length ?? 0;
    if (totalHabits === 0) return 0;

    // 2. Get all habit logs ordered by date desc
    const { data: logs } = await supabase
      .from("habit_logs")
      .select("log_date, completed")
      .eq("user_id", userId)
      .order("log_date", { ascending: false });

    if (!logs || logs.length === 0) return 0;

    // 3. Group logs by date and count completed per day
    const logsByDate: Record<string, number> = {};

    for (const log of logs) {
      if (!logsByDate[log.log_date]) {
        logsByDate[log.log_date] = 0;
      }
      if (log.completed) {
        logsByDate[log.log_date]++;
      }
    }

    // 4. Compute streak based on consecutive full-completion days
    //    - Count consecutive full days starting from yesterday backwards
    //    - If today is fully completed, include it on top
    let streak = 0;

    // helper to format a Date to YYYY-MM-DD
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);

    // Count backwards starting from yesterday
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

    // If today is already fully completed, include it on top
    const todayKey = formatDate(new Date());
    const todayCompleted = (logsByDate[todayKey] ?? 0) === totalHabits;
    if (todayCompleted) return streak + 1;

    return streak;
  }

  const streak = await getCurrentStreak(supabase, session.user.id);

  const { data: heatmapLogs } = await supabase
    .from("habit_logs")
    .select("log_date, completed")
    .eq("user_id", session.user.id);

  const totalHabits = habits?.length ?? 0;

  const heatmap: Record<string, number> = {};

  if (heatmapLogs && totalHabits > 0) {
    const grouped: Record<string, boolean[]> = {};

    for (const log of heatmapLogs) {
      if (!grouped[log.log_date]) {
        grouped[log.log_date] = [];
      }
      grouped[log.log_date].push(log.completed);
    }

    for (const date in grouped) {
      const completedCount = grouped[date].filter(Boolean).length;
      heatmap[date] = completedCount / totalHabits;
    }
  }

  return (
    <DashboardContent
      habits={habits ?? []}
      userId={session.user.id}
      logs={logs ?? []}
      streak={streak}
      heatmap={heatmap}
    />
  );
}
