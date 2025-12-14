"use client";

import MonthHeatmap from "./month-heatmap";

export default function YearHeatmap({
  data,
}: {
  data: Record<string, number>;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold">Year Progress</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, month) => (
          <MonthHeatmap
            key={month}
            year={year}
            month={month}
            data={data}
          />
        ))}
      </div>
    </div>
  );
}
