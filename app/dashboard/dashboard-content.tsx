"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HabitList from "./habit-list";
import YearHeatmap from "./year-heatmap";
import Confetti from "./confetti";
import Celebration from "./celebration";

type Habit = {
  id: string;
  title: string;
};

type HabitLog = {
  habit_id: string;
  completed: boolean;
};

export default function DashboardContent({
  habits,
  userId,
  logs,
  streak,
  heatmap,
}: {
  habits: Habit[];
  userId: string;
  logs: HabitLog[];
  streak: number;
  heatmap: Record<string, number>;
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakState, setStreakState] = useState(streak);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalIndex, setModalIndex] = useState(0);
  const [previousPercentage, setPreviousPercentage] = useState(0);
  const router = useRouter();

  // Calculate current percentage
  const activeHabitsCount = habits.length;
  const completedHabits = habits.filter(habit => logs.some(log => log.habit_id === habit.id && log.completed)).length;
  const currentPercentage = activeHabitsCount === 0 ? 0 : Math.round((completedHabits / activeHabitsCount) * 100);

  // Trigger confetti when reaching 100%
  useEffect(() => {
    if (currentPercentage === 100 && previousPercentage !== 100) {
      setShowConfetti(true);
      // Auto-hide after animation
      const timer = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(timer);
    }
    setPreviousPercentage(currentPercentage);
  }, [currentPercentage, previousPercentage]);

  // Handler passed to HabitList so it can trigger confetti and refresh
  const handleAllComplete = () => {
    // show confetti
    setShowConfetti(true);

    // motivational messages (one shown at a time, advances after modal closes)
    const messages = [
      "You crushed it today — keep that energy up!",
      "Consistency wins. Great job completing every habit!",
      "One day at a time, and today was yours. Amazing!",
      "You built momentum — tomorrow's streak starts now!",
      "Small wins compound. Celebrate this one!",
      "Awesome work — your future self thanks you!",
    ];

    // read stored index (default 0)
    let idx = 0;
    try {
      const stored = localStorage.getItem("motivationIndex");
      if (stored !== null) idx = parseInt(stored, 10) || 0;
    } catch (e) {
      // localStorage not available, fall back to 0
      idx = 0;
    }

    // clamp and set
    idx = idx % messages.length;
    setModalIndex(idx);
    setModalMessage(messages[idx]);
    setShowModal(true);

    // refresh server data (streak/logs) so page shows authoritative values
    try {
      router.refresh();
    } catch (e) {
      console.error("router.refresh failed", e);
    }

    // hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3500);
    // auto-close modal after a few seconds and advance the stored index
    setTimeout(() => handleModalClose(), 4500);
  };

  // Close handler that advances the message index (persisted in localStorage)
  const handleModalClose = () => {
    setShowModal(false);
    try {
      const messagesLength = 6; // must match messages array above
      const next = (modalIndex + 1) % messagesLength;
      localStorage.setItem("motivationIndex", String(next));
      setModalIndex(next);
    } catch (e) {
      // ignore storage errors
    }
  };

  // Called by HabitList after each checkbox update when the API returns new streak
  const handleStreakUpdate = (newStreak: number) => {
    if (typeof newStreak !== "number") return;
    // show confetti if the streak increased
    if (newStreak > streakState) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
    setStreakState(newStreak);
  };

  return (
    <>
      <Confetti trigger={showConfetti} />
      <Celebration open={showModal} message={modalMessage} onClose={() => setShowModal(false)} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">
              Today's Habits
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {habits?.length ?? 0} habits to complete
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 mb-8">
            <HabitList
              habits={habits ?? []}
              userId={userId}
              logs={logs ?? []}
              streak={streakState}
              onAllComplete={handleAllComplete}
              onStreakUpdate={handleStreakUpdate}
            />
          </div>

          {/* Heatmap Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Year Overview
            </h2>
            <YearHeatmap data={heatmap} />
          </div>
        </div>
      </div>
    </>
  );
}
