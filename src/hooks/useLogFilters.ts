import { useState, useMemo } from "react";
import { Log } from "./useLogs";
import { startOfDay, endOfDay, isWithinInterval } from "date-fns";

export type SortOption = "date-desc" | "date-asc" | "title-asc" | "title-desc";

export const useLogFilters = (logs: Log[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.title.toLowerCase().includes(query) ||
          log.content.toLowerCase().includes(query) ||
          log.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((log) =>
        selectedTags.every((tag) => log.tags.includes(tag))
      );
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((log) => {
        if (dateRange.from && dateRange.to) {
          return isWithinInterval(log.date, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        } else if (dateRange.from) {
          return log.date >= startOfDay(dateRange.from);
        } else if (dateRange.to) {
          return log.date <= endOfDay(dateRange.to);
        }
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return b.date.getTime() - a.date.getTime();
        case "date-asc":
          return a.date.getTime() - b.date.getTime();
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [logs, searchQuery, selectedTags, dateRange, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setDateRange({});
    setSortBy("date-desc");
  };

  const hasActiveFilters = !!(
    searchQuery ||
    selectedTags.length > 0 ||
    dateRange.from ||
    dateRange.to
  );

  return {
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    toggleTag,
    dateRange,
    setDateRange,
    sortBy,
    setSortBy,
    filteredLogs,
    clearFilters,
    hasActiveFilters,
  };
};
