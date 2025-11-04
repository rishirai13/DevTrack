import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import LogCard from "@/components/LogCard";
import AddLogModal from "@/components/AddLogModal";
import EmptyState from "@/components/EmptyState";
import InsightCard from "@/components/InsightCard";
import FilterBar from "@/components/FilterBar";
import { Flame, Calendar, Tag } from "lucide-react";
import { useLogs } from "@/hooks/useLogs";
import { useTags } from "@/hooks/useTags";
import { useLogFilters } from "@/hooks/useLogFilters";
import { useStreaks } from "@/hooks/useStreaks";
import { toast } from "sonner";

const Dashboard = () => {
  const { logs, isLoading, addLog, updateLog, deleteLog } = useLogs();
  const { allTags, getMostUsedTag, getSuggestedTags } = useTags(logs);
  const { currentStreak } = useStreaks(logs);
  const {
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    dateRange,
    setDateRange,
    sortBy,
    setSortBy,
    filteredLogs,
    clearFilters,
    hasActiveFilters,
  } = useLogFilters(logs);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<string | null>(null);

  const handleAddLog = (data: any) => {
    addLog(data);
    toast.success("Log created successfully!");
  };

  const handleEditLog = (id: string) => {
    setEditingLog(id);
    setIsModalOpen(true);
  };

  const handleUpdateLog = (data: any) => {
    if (editingLog) {
      updateLog(editingLog, data);
      toast.success("Log updated successfully!");
      setEditingLog(null);
    }
  };

  const handleDeleteLog = (id: string) => {
    deleteLog(id);
    toast.success("Log deleted");
  };

  const editingLogData = editingLog
    ? logs.find((log) => log.id === editingLog)
    : null;

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger />
                <Skeleton className="h-8 w-32" />
              </div>
            </header>
            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48" />
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
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Button
                  onClick={() => {
                    setEditingLog(null);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Log
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Insights Row */}
            <div className="grid gap-4 md:grid-cols-3">
              <InsightCard
                title="Current Streak"
                icon={Flame}
                trend={
                  currentStreak > 0
                    ? { value: "Keep it up!", isPositive: true }
                    : undefined
                }
              >
                <div className="text-3xl font-bold">{currentStreak} days</div>
              </InsightCard>

              <InsightCard title="Total Logs" icon={Calendar}>
                <div className="text-3xl font-bold">{logs.length}</div>
              </InsightCard>

              <InsightCard title="Most Used Tag" icon={Tag}>
                <div className="text-3xl font-bold">{getMostUsedTag()}</div>
              </InsightCard>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <FilterBar
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              allTags={allTags}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Logs Grid */}
            {filteredLogs.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={logs.length === 0 ? "No logs yet" : "No matching logs"}
                description={
                  logs.length === 0
                    ? "Start your developer journey by creating your first log entry."
                    : "Try adjusting your search or filters."
                }
                actionLabel={logs.length === 0 ? "Create First Log" : undefined}
                onAction={
                  logs.length === 0
                    ? () => {
                        setEditingLog(null);
                        setIsModalOpen(true);
                      }
                    : undefined
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLogs.map((log) => (
                  <LogCard
                    key={log.id}
                    {...log}
                    onEdit={handleEditLog}
                    onDelete={handleDeleteLog}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Floating Action Button (Mobile) */}
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
            onClick={() => {
              setEditingLog(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </main>

        <AddLogModal
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setEditingLog(null);
          }}
          onSubmit={editingLog ? handleUpdateLog : handleAddLog}
          initialData={editingLogData || undefined}
          tagSuggestions={allTags}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
