import { useMemo } from "react";
import { Log } from "./useLogs";
import { differenceInDays, startOfDay, isSameDay } from "date-fns";

export const useStreaks = (logs: Log[]) => {
  const currentStreak = useMemo(() => {
    if (logs.length === 0) return 0;

    const sortedLogs = [...logs].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    const today = startOfDay(new Date());
    const uniqueDates = new Set(
      sortedLogs.map((log) => startOfDay(log.date).getTime())
    );

    // Check if there's a log today or yesterday
    const mostRecentLog = startOfDay(sortedLogs[0].date);
    const daysSinceLastLog = differenceInDays(today, mostRecentLog);

    if (daysSinceLastLog > 1) return 0;

    let streak = 0;
    let currentDate = today;

    while (uniqueDates.has(currentDate.getTime())) {
      streak++;
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }, [logs]);

  const longestStreak = useMemo(() => {
    if (logs.length === 0) return 0;

    const sortedLogs = [...logs].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    const uniqueDates = Array.from(
      new Set(sortedLogs.map((log) => startOfDay(log.date).getTime()))
    ).sort((a, b) => a - b);

    let maxStreak = 1;
    let currentStreakCount = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const dayDiff = differenceInDays(currDate, prevDate);

      if (dayDiff === 1) {
        currentStreakCount++;
        maxStreak = Math.max(maxStreak, currentStreakCount);
      } else {
        currentStreakCount = 1;
      }
    }

    return maxStreak;
  }, [logs]);

  return {
    currentStreak,
    longestStreak,
  };
};
