"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import ProgressDonut from "./progress-donut";

type Habit = {
  id: string;
  title: string;
};

type HabitLog = {
  habit_id: string;
  completed: boolean;
};

export default function HabitList({
  habits,
  userId,
  logs,
  streak,
  onAllComplete,
  onStreakUpdate,
}: {
  habits: Habit[];
  userId: string;
  logs: HabitLog[];
  streak: number;
  onAllComplete?: () => void;
  onStreakUpdate?: (streak: number) => void;
}) {
  const supabase = createSupabaseBrowserClient();

  const initialState = Object.fromEntries(
    logs.map((log) => [log.habit_id, log.completed])
  );

  const [checked, setChecked] = useState<Record<string, boolean>>(initialState);

  const today = new Date().toISOString().slice(0, 10);

  async function toggleHabit(habitId: string) {
    const isCompleted = !checked[habitId];

    setChecked((prev) => ({
      ...prev,
      [habitId]: isCompleted,
    }));

    await supabase.from("habit_logs").upsert(
      {
        user_id: userId,
        habit_id: habitId,
        log_date: today,
        completed: isCompleted,
      },
      {
        onConflict: "habit_id,log_date",
      }
    );

    // build the updated checked map and count completed
    const updatedChecked = { ...checked, [habitId]: isCompleted };
    const newCompleted = habits.filter((h) => !!updatedChecked[h.id]).length;

    // after upsert, fetch authoritative streak and notify parent
    try {
      const res = await fetch("/api/streak", { credentials: "same-origin" });
      if (res.ok) {
        const json = await res.json();
        if (typeof onStreakUpdate === "function") onStreakUpdate(json.streak ?? 0);
      }
    } catch (e) {
      console.error("failed to refresh streak", e);
    }

    // if client-side all are completed, notify parent for confetti/refresh
    if (newCompleted === habits.length && typeof onAllComplete === "function") {
      try {
        onAllComplete();
      } catch (e) {
        console.error("onAllComplete handler error", e);
      }
    }
  }

  // Only count habits that actually exist and have been logged
  const activeHabitsCount = habits.length;
  const completedHabits = habits.filter(habit => checked[habit.id] === true).length;

  return (
    <>
      {/* Progress Section */}
      <div className="mb-10">
        <div className="flex flex-col items-center">
          <ProgressDonut completed={completedHabits} total={activeHabitsCount} />
          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Current Streak
            </p>
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mt-2">
              {streak} 🔥
            </p>
          </div>
        </div>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No habits yet. Create one in Manage Habits!
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-colors cursor-pointer group"
              onClick={() => toggleHabit(habit.id)}
            >
              <input
                type="checkbox"
                checked={!!checked[habit.id]}
                onChange={() => toggleHabit(habit.id)}
                className="h-6 w-6 cursor-pointer rounded-lg border-2 border-slate-300 dark:border-slate-600 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              />
              <span
                className={`flex-1 font-medium text-lg transition-all ${
                  checked[habit.id]
                    ? "text-slate-400 dark:text-slate-500 line-through"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {habit.title}
              </span>
              {checked[habit.id] && (
                <span className="text-2xl">✓</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
