import { useMemo, useEffect } from "react";
import { Log } from "./useLogs";
import { startOfWeek, endOfWeek, isWithinInterval, format, startOfDay, eachDayOfInterval, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useInsights = (logs: Log[]) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cached insights from database
  const { data: cachedInsights } = useQuery({
    queryKey: ["insights", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const weekStart = startOfWeek(new Date());
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", format(weekStart, "yyyy-MM-dd"))
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user,
  });

  // Generate fresh insights when logs change
  useEffect(() => {
    if (!user || logs.length === 0) return;

    const generateInsights = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await supabase.functions.invoke("generate-insights", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        // Invalidate insights query to refetch
        queryClient.invalidateQueries({ queryKey: ["insights", user.id] });
      } catch (error) {
        console.error("Error generating insights:", error);
      }
    };

    // Debounce insight generation
    const timer = setTimeout(generateInsights, 2000);
    return () => clearTimeout(timer);
  }, [logs, user, queryClient]);

  // Set up real-time subscription for insights updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("insights-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "insights",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["insights", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Weekly goal progress (logs this week)
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    const logsThisWeek = logs.filter((log) =>
      isWithinInterval(log.date, { start: weekStart, end: weekEnd })
    );
    
    return {
      count: logsThisWeek.length,
      goal: 7,
      percentage: Math.round((logsThisWeek.length / 7) * 100),
    };
  }, [logs]);

  // Learning rate (comparison with last week)
  const learningRate = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now);
    const lastWeekStart = startOfWeek(subDays(now, 7));
    const lastWeekEnd = endOfWeek(subDays(now, 7));
    
    const logsThisWeek = logs.filter((log) =>
      isWithinInterval(log.date, { start: thisWeekStart, end: now })
    );
    
    const logsLastWeek = logs.filter((log) =>
      isWithinInterval(log.date, { start: lastWeekStart, end: lastWeekEnd })
    );
    
    if (logsLastWeek.length === 0) return { change: 0, isPositive: true };
    
    const change = ((logsThisWeek.length - logsLastWeek.length) / logsLastWeek.length) * 100;
    
    return {
      change: Math.round(change),
      isPositive: change >= 0,
    };
  }, [logs]);

  // Average session time (estimated from content length)
  const avgSessionTime = useMemo(() => {
    if (logs.length === 0) return 0;
    
    const totalWords = logs.reduce((sum, log) => {
      const words = log.content.split(/\s+/).length;
      return sum + words;
    }, 0);
    
    // Estimate ~3 minutes per 100 words
    const totalMinutes = (totalWords / 100) * 3;
    return Math.round(totalMinutes / logs.length);
  }, [logs]);

  // Activity data for charts (last 30 days)
  const activityData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });
    
    return days.map((day) => {
      const dayLogs = logs.filter((log) => {
        const logDay = startOfDay(log.date);
        const currentDay = startOfDay(day);
        return logDay.getTime() === currentDay.getTime();
      });
      
      return {
        date: format(day, "MMM dd"),
        fullDate: day,
        count: dayLogs.length,
      };
    });
  }, [logs]);

  // Tag frequency data
  const tagFrequencyData = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    
    logs.forEach((log) => {
      log.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [logs]);

  // Most active day of week
  const mostActiveDay = useMemo(() => {
    if (logs.length === 0) return "No data";
    
    const dayCounts: Record<string, number> = {};
    
    logs.forEach((log) => {
      const day = format(log.date, "EEEE");
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    const [day] = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])[0] || ["No data", 0];
    
    return day;
  }, [logs]);

  // Achievement tracking
  const achievements = useMemo(() => {
    const badges = [];
    
    if (logs.length >= 1) badges.push({ id: "first_log", name: "First Entry", description: "Created your first log" });
    if (logs.length >= 10) badges.push({ id: "10_logs", name: "Getting Started", description: "Created 10 logs" });
    if (logs.length >= 50) badges.push({ id: "50_logs", name: "Dedicated Learner", description: "Created 50 logs" });
    if (logs.length >= 100) badges.push({ id: "100_logs", name: "Century Club", description: "Created 100 logs" });
    
    const uniqueDates = new Set(logs.map((log) => format(startOfDay(log.date), "yyyy-MM-dd")));
    if (uniqueDates.size >= 7) badges.push({ id: "week_streak", name: "Week Warrior", description: "7 day streak" });
    if (uniqueDates.size >= 30) badges.push({ id: "month_streak", name: "Monthly Master", description: "30 day streak" });
    
    const uniqueTags = new Set(logs.flatMap((log) => log.tags));
    if (uniqueTags.size >= 5) badges.push({ id: "5_tags", name: "Tag Explorer", description: "Used 5 different tags" });
    if (uniqueTags.size >= 10) badges.push({ id: "10_tags", name: "Tag Master", description: "Used 10 different tags" });

    return badges;
  }, [logs]);

  // Learning recommendations
  const recommendations = useMemo(() => {
    const tips = [];
    
    if (weeklyProgress.count < 3) {
      tips.push("Try to log at least 3 times this week to build consistency");
    }
    
    if (mostActiveDay !== "No data" && weeklyProgress.count < 7) {
      tips.push(`Your most active day is ${mostActiveDay}. Consider logging on other days too!`);
    }
    
    const recentTags = logs.slice(0, 10).flatMap((log) => log.tags);
    const uniqueRecentTags = new Set(recentTags);
    if (uniqueRecentTags.size < 3 && logs.length > 10) {
      tips.push("Try exploring new topics to diversify your learning");
    }

    if (avgSessionTime < 5 && logs.length > 5) {
      tips.push("Consider writing more detailed logs to capture deeper insights");
    }

    return tips;
  }, [logs, weeklyProgress, mostActiveDay, avgSessionTime]);

  return {
    weeklyProgress,
    learningRate,
    avgSessionTime,
    activityData,
    tagFrequencyData,
    mostActiveDay,
    achievements,
    recommendations,
    cachedInsights: cachedInsights?.data,
  };
};
