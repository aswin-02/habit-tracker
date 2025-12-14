"use client";

export default function ProgressDonut({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Determine color based on completion percentage
  const getProgressColor = () => {
    if (percentage === 100) return "from-green-400 via-emerald-400 to-teal-500";
    if (percentage >= 75) return "from-blue-400 via-cyan-400 to-blue-500";
    if (percentage >= 50) return "from-amber-400 via-orange-400 to-orange-500";
    if (percentage >= 25) return "from-orange-400 via-rose-400 to-red-400";
    return "from-red-400 via-rose-400 to-pink-500";
  };

  // SVG circular progress
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Circular Progress Ring */}
      <div className="relative w-72 h-72">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full blur-3xl"></div>

        {/* SVG Container */}
        <svg className="w-full h-full" viewBox="0 0 240 240">
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200 dark:text-slate-700"
          />

          {/* Progress circle with gradient */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#glow)"
            className="transition-all duration-1000 ease-out"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "120px 120px",
            }}
          />

          {/* Center circle background */}
          <circle
            cx="120"
            cy="120"
            r="75"
            fill="currentColor"
            className="text-white dark:text-slate-900"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className={`text-6xl font-bold bg-gradient-to-r ${getProgressColor()} bg-clip-text text-transparent mb-2`}>
              {percentage}%
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              Complete
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-700">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{completed}</div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2 uppercase tracking-wide">
            Done
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-800/30 rounded-xl p-4 text-center border border-slate-200 dark:border-slate-700">
          <div className="text-3xl font-bold text-slate-600 dark:text-slate-400">{total}</div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2 uppercase tracking-wide">
            Total
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-4 text-center border border-orange-200 dark:border-orange-700">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{total - completed}</div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2 uppercase tracking-wide">
            Left
          </div>
        </div>
      </div>
    </div>
  );
}
