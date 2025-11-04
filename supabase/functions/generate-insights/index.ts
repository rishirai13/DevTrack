import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Log {
  id: string;
  date: string;
  content: string;
  tags: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Get user's logs for the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: logsData, error: logsError } = await supabase
      .from("logs")
      .select(`
        id,
        date,
        content,
        title,
        log_tags (
          tags (
            name
          )
        )
      `)
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (logsError) throw logsError;

    // Transform data
    const logs: Log[] = (logsData || []).map((log: any) => ({
      id: log.id,
      date: log.date,
      content: log.content,
      tags: log.log_tags.map((lt: any) => lt.tags.name),
    }));

    // Calculate insights
    const insights = calculateInsights(logs);

    // Get current week start
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Upsert insights to database
    const { error: upsertError } = await supabase
      .from("insights")
      .upsert({
        user_id: user.id,
        week_start: weekStart.toISOString().split("T")[0],
        data: insights,
      }, {
        onConflict: "user_id,week_start",
      });

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({ success: true, insights }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

function calculateInsights(logs: Log[]) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());

  // Weekly stats
  const logsThisWeek = logs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate >= weekStart;
  });

  // Tag frequency
  const tagCounts: Record<string, number> = {};
  logs.forEach((log) => {
    log.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Streak calculation
  const uniqueDates = [...new Set(logs.map((log) => log.date))].sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Check if there's a log today or yesterday
  if (uniqueDates.includes(today) || uniqueDates.includes(yesterdayStr)) {
    let checkDate = uniqueDates.includes(today) ? new Date(today) : new Date(yesterdayStr);
    currentStreak = 1;

    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const prevDate = new Date(uniqueDates[i]);
      checkDate.setDate(checkDate.getDate() - 1);
      
      if (prevDate.toISOString().split("T")[0] === checkDate.toISOString().split("T")[0]) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < uniqueDates.length; i++) {
    const curr = new Date(uniqueDates[i]);
    const prev = new Date(uniqueDates[i - 1]);
    const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Most active day
  const dayCounts: Record<string, number> = {};
  logs.forEach((log) => {
    const day = new Date(log.date).toLocaleDateString("en-US", { weekday: "long" });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "No data";

  // Learning patterns
  const avgWordsPerLog = logs.length > 0
    ? Math.round(logs.reduce((sum, log) => sum + log.content.split(/\s+/).length, 0) / logs.length)
    : 0;

  const consistencyScore = logs.length > 0 
    ? Math.min(100, Math.round((uniqueDates.length / 90) * 100))
    : 0;

  return {
    weeklyCount: logsThisWeek.length,
    totalLogs: logs.length,
    currentStreak,
    longestStreak,
    topTags,
    mostActiveDay,
    avgWordsPerLog,
    consistencyScore,
    lastUpdated: new Date().toISOString(),
  };
}
