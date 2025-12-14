import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ManageHabits from "./manage-habits";

export default async function ManageHabitsPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: habits, error } = await supabase
    .from("habits")
    .select("id, title, is_active")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">
            Manage Habits
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Create, edit, and delete your habits
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8">
          <ManageHabits habits={habits ?? []} userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}
