import { useMemo } from "react";
import { Log } from "./useLogs";

export const useTags = (logs: Log[]) => {
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    logs.forEach((log) => {
      log.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [logs]);

  const getTagFrequency = () => {
    const frequency: Record<string, number> = {};
    logs.forEach((log) => {
      log.tags.forEach((tag) => {
        frequency[tag] = (frequency[tag] || 0) + 1;
      });
    });
    return frequency;
  };

  const getMostUsedTag = () => {
    const frequency = getTagFrequency();
    let mostUsedTag = "";
    let maxCount = 0;

    Object.entries(frequency).forEach(([tag, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedTag = tag;
      }
    });

    return mostUsedTag || "None";
  };

  const getSuggestedTags = (input: string) => {
    if (!input) return allTags.slice(0, 5);
    
    const lowerInput = input.toLowerCase();
    return allTags
      .filter((tag) => tag.toLowerCase().includes(lowerInput))
      .slice(0, 5);
  };

  return {
    allTags,
    getTagFrequency,
    getMostUsedTag,
    getSuggestedTags,
  };
};
