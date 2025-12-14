"use client";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from "date-fns";

export default function MonthHeatmap({
  year,
  month,
  data,
}: {
  year: number;
  month: number;
  data: Record<string, number>;
}) {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  function getColor(value?: number) {
    if (value === undefined) return "bg-gray-200";
    if (value === 1) return "bg-green-700";
    if (value >= 0.67) return "bg-green-500";
    if (value >= 0.34) return "bg-green-400";
    if (value > 0) return "bg-green-300";
    return "bg-gray-300";
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">
        {format(start, "MMM")}
      </h3>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const key = format(day, "yyyy-MM-dd");
          return (
            <div
              key={key}
              title={`${key}: ${Math.round((data[key] ?? 0) * 100)}%`}
              className={`w-3 h-3 rounded ${getColor(data[key])}`}
            />
          );
        })}
      </div>
    </div>
  );
}
