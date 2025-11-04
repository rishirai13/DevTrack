import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";

const logSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required").max(5000, "Content must be less than 5000 characters"),
  tags: z.array(z.string()).default([]),
  date: z.date().optional(),
});

export type Log = {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export const useLogs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch logs with tags
  // Set up real-time subscription for logs
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("logs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "logs",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["logs", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["logs", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: logsData, error: logsError } = await supabase
        .from("logs")
        .select(`
          id,
          title,
          content,
          date,
          created_at,
          updated_at,
          log_tags (
            tag_id,
            tags (
              name
            )
          )
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (logsError) throw logsError;

      return logsData.map((log: any) => ({
        id: log.id,
        title: log.title,
        content: log.content,
        date: new Date(log.date),
        tags: log.log_tags?.map((lt: any) => lt.tags.name) || [],
        createdAt: new Date(log.created_at),
        updatedAt: new Date(log.updated_at),
      }));
    },
    enabled: !!user,
  });

  // Add log mutation
  const addLogMutation = useMutation({
    mutationFn: async (data: z.infer<typeof logSchema>) => {
      if (!user) throw new Error("User not authenticated");

      const validated = logSchema.parse(data);

      // Insert log
      const { data: logData, error: logError } = await supabase
        .from("logs")
        .insert({
          user_id: user.id,
          title: validated.title,
          content: validated.content,
          date: validated.date?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (logError) throw logError;

      // Handle tags
      if (validated.tags.length > 0) {
        // Get or create tags
        const tagIds = await Promise.all(
          validated.tags.map(async (tagName) => {
            const { data: existingTag } = await supabase
              .from("tags")
              .select("id")
              .eq("user_id", user.id)
              .eq("name", tagName)
              .maybeSingle();

            if (existingTag) return existingTag.id;

            const { data: newTag, error: tagError } = await supabase
              .from("tags")
              .insert({ user_id: user.id, name: tagName })
              .select("id")
              .single();

            if (tagError) throw tagError;
            return newTag.id;
          })
        );

        // Link tags to log
        const { error: linkError } = await supabase
          .from("log_tags")
          .insert(tagIds.map((tag_id) => ({ log_id: logData.id, tag_id })));

        if (linkError) throw linkError;
      }

      return logData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });

  // Update log mutation
  const updateLogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof logSchema> }) => {
      if (!user) throw new Error("User not authenticated");

      const validated = logSchema.parse(data);

      // Update log
      const { error: logError } = await supabase
        .from("logs")
        .update({
          title: validated.title,
          content: validated.content,
          date: validated.date?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (logError) throw logError;

      // Delete existing tag associations
      const { error: deleteError } = await supabase
        .from("log_tags")
        .delete()
        .eq("log_id", id);

      if (deleteError) throw deleteError;

      // Handle tags
      if (validated.tags.length > 0) {
        const tagIds = await Promise.all(
          validated.tags.map(async (tagName) => {
            const { data: existingTag } = await supabase
              .from("tags")
              .select("id")
              .eq("user_id", user.id)
              .eq("name", tagName)
              .maybeSingle();

            if (existingTag) return existingTag.id;

            const { data: newTag, error: tagError } = await supabase
              .from("tags")
              .insert({ user_id: user.id, name: tagName })
              .select("id")
              .single();

            if (tagError) throw tagError;
            return newTag.id;
          })
        );

        const { error: linkError } = await supabase
          .from("log_tags")
          .insert(tagIds.map((tag_id) => ({ log_id: id, tag_id })));

        if (linkError) throw linkError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });

  // Delete log mutation
  const deleteLogMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("logs")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });

  return {
    logs,
    isLoading,
    addLog: (data: z.infer<typeof logSchema>) => addLogMutation.mutateAsync(data),
    updateLog: (id: string, data: z.infer<typeof logSchema>) =>
      updateLogMutation.mutateAsync({ id, data }),
    deleteLog: (id: string) => deleteLogMutation.mutateAsync(id),
  };
};
