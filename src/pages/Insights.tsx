import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import InsightCard from "@/components/InsightCard";
import { Flame, Target, TrendingUp, Clock, Calendar, Lightbulb } from "lucide-react";
import { useLogs } from "@/hooks/useLogs";
import { useStreaks } from "@/hooks/useStreaks";
import { useInsights } from "@/hooks/useInsights";
import ActivityChart from "@/components/charts/ActivityChart";
import TagFrequencyChart from "@/components/charts/TagFrequencyChart";
import StreakCalendar from "@/components/charts/StreakCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import AchievementBadge from "@/components/AchievementBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Insights = () => {
  const { logs, isLoading } = useLogs();
  const { currentStreak } = useStreaks(logs);
  const { 
    weeklyProgress, 
    learningRate, 
    avgSessionTime, 
    activityData, 
    tagFrequencyData, 
    mostActiveDay,
    achievements,
    recommendations,
  } = useInsights(logs);

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold">Insights</h1>
              </div>
            </header>
            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold">Insights</h1>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InsightCard
                title="Current Streak"
                icon={Flame}
                trend={currentStreak > 0 ? { value: "Keep it up!", isPositive: true } : undefined}
              >
                <div className="text-3xl font-bold">{currentStreak} days</div>
              </InsightCard>

              <InsightCard title="Weekly Goal" icon={Target}>
                <div className="text-3xl font-bold">
                  {weeklyProgress.count}/{weeklyProgress.goal}
                </div>
                <div className="text-sm text-muted-foreground">
                  {weeklyProgress.percentage}% complete
                </div>
              </InsightCard>

              <InsightCard
                title="Learning Rate"
                icon={TrendingUp}
                trend={{
                  value: `${learningRate.change > 0 ? "+" : ""}${learningRate.change}% vs last week`,
                  isPositive: learningRate.isPositive,
                }}
              >
                <div className="text-3xl font-bold">{weeklyProgress.count} logs</div>
              </InsightCard>

              <InsightCard title="Avg. Session" icon={Clock}>
                <div className="text-3xl font-bold">{avgSessionTime}m</div>
                <div className="text-sm text-muted-foreground">per log entry</div>
              </InsightCard>

              <InsightCard title="Most Active Day" icon={Calendar}>
                <div className="text-2xl font-bold">{mostActiveDay}</div>
              </InsightCard>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ActivityChart data={activityData} />
              <TagFrequencyChart data={tagFrequencyData} />
            </div>

            {/* Heatmap */}
            <StreakCalendar logs={logs} />

            {/* Achievements */}
            {achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {achievements.map((achievement) => (
                      <AchievementBadge
                        key={achievement.id}
                        name={achievement.name}
                        description={achievement.description}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Learning Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recommendations.map((tip, index) => (
                    <Alert key={index}>
                      <AlertDescription>{tip}</AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Insights;
