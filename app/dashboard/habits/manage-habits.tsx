"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Habit = {
  id: string;
  title: string;
  is_active: boolean;
};

export default function ManageHabits({
  habits,
  userId,
}: {
  habits: Habit[];
  userId: string;
}) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [newHabit, setNewHabit] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function addHabit() {
    if (!newHabit.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("habits").insert({
        user_id: userId,
        title: newHabit.trim(),
      });

      if (error) throw error;

      setNewHabit("");
      router.refresh();
    } catch (error) {
      console.error("Error adding habit:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateHabit(habitId: string) {
    if (!editingTitle.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("habits")
        .update({ title: editingTitle.trim() })
        .eq("id", habitId)
        .eq("user_id", userId);

      if (error) throw error;

      setEditingId(null);
      setEditingTitle("");
      router.refresh();
    } catch (error) {
      console.error("Error updating habit:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteHabit(habitId: string) {
    if (!confirm("Delete this habit? This will remove all logs associated with it.")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("habits")
        .update({ is_active: false })
        .eq("id", habitId)
        .eq("user_id", userId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Error deleting habit:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Habit Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Create New Habit
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newHabit}
            onChange={e => setNewHabit(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addHabit()}
            placeholder="Enter habit name..."
            className="flex-1 min-w-0 w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            type="button"
            onClick={addHabit}
            disabled={loading}
            className="w-full sm:w-auto flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg text-center"
          >
            {loading ? "..." : "Add"}
          </button>
        </div>
      </div>

      {/* Habits List */}
      {habits.filter(h => h.is_active).length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            No habits yet. Create your first habit above!
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {habits
            .filter(h => h.is_active)
            .map(habit => (
              <li
                key={habit.id}
                className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-colors group"
              >
                {editingId === habit.id ? (
                  <input
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && updateHabit(habit.id)}
                    className="flex-1 px-3 py-2 border border-blue-400 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 text-lg font-medium text-slate-900 dark:text-white">
                    {habit.title}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {editingId === habit.id ? (
                    <>
                      <button
                        onClick={() => updateHabit(habit.id)}
                        disabled={loading}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingTitle("");
                        }}
                        disabled={loading}
                        className="px-3 py-2 bg-slate-400 hover:bg-slate-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(habit.id);
                          setEditingTitle(habit.title);
                        }}
                        disabled={loading}
                        className="px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        disabled={loading}
                        className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
