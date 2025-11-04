import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  display_name: z.string().max(50, "Display name must be less than 50 characters").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatar_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  public_mode: z.boolean().optional(),
});

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  public_mode: boolean;
  created_at: string;
  updated_at: string;
};

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      if (!user) throw new Error("User not authenticated");

      const validated = profileSchema.parse(data);

      const { error } = await supabase
        .from("profiles")
        .update(validated)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    profile,
    isLoading,
    updateProfile: (data: z.infer<typeof profileSchema>) =>
      updateProfileMutation.mutateAsync(data),
  };
};

// Hook for fetching public profiles
export const usePublicProfile = (username: string) => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["publicProfile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .eq("public_mode", true)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!username,
  });

  return { profile, isLoading };
};

// Hook for fetching public logs
export const usePublicLogs = (userId: string) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["publicLogs", userId],
    queryFn: async () => {
      const { data: logsData, error } = await supabase
        .from("logs")
        .select(`
          id,
          title,
          content,
          date,
          created_at,
          log_tags (
            tag_id,
            tags (
              name
            )
          )
        `)
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(50);

      if (error) throw error;

      return logsData.map((log: any) => ({
        id: log.id,
        title: log.title,
        content: log.content,
        date: log.date,
        created_at: log.created_at,
        tags: log.log_tags?.map((lt: any) => lt.tags.name) || [],
      }));
    },
    enabled: !!userId,
  });

  return { logs, isLoading };
};
