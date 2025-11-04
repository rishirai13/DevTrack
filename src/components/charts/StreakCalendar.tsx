import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Log } from "@/hooks/useLogs";
import { startOfDay, format, eachDayOfInterval, subDays } from "date-fns";
import { useMemo } from "react";

interface StreakCalendarProps {
  logs: Log[];
}

const StreakCalendar = ({ logs }: StreakCalendarProps) => {
  const heatmapData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 89), // Last ~3 months (90 days)
      end: new Date(),
    });

    const logsByDay = new Map<string, number>();
    logs.forEach((log) => {
      const dayKey = format(startOfDay(log.date), "yyyy-MM-dd");
      logsByDay.set(dayKey, (logsByDay.get(dayKey) || 0) + 1);
    });

    return days.map((day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      const count = logsByDay.get(dayKey) || 0;
      return {
        date: day,
        dateStr: dayKey,
        count,
        intensity: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4,
      };
    });
  }, [logs]);

  const weeks = useMemo(() => {
    const weeksArray: typeof heatmapData[] = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      weeksArray.push(heatmapData.slice(i, i + 7));
    }
    return weeksArray;
  }, [heatmapData]);

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return "bg-muted";
      case 1:
        return "bg-primary/20";
      case 2:
        return "bg-primary/40";
      case 3:
        return "bg-primary/60";
      case 4:
        return "bg-primary";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap (Last 90 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.dateStr}
                    className={`w-3 h-3 rounded-sm ${getIntensityColor(day.intensity)} transition-colors`}
                    title={`${format(day.date, "MMM dd, yyyy")}: ${day.count} log${day.count !== 1 ? "s" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((intensity) => (
                <div
                  key={intensity}
                  className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCalendar;
