import { useParams, Link } from "react-router-dom";
import { usePublicProfile, usePublicLogs } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Rocket } from "lucide-react";
import LogCard from "@/components/LogCard";

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { profile, isLoading: profileLoading } = usePublicProfile(username || "");
  const { logs, isLoading: logsLoading } = usePublicLogs(profile?.id || "");

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This profile doesn't exist or is not public.
          </p>
          <Link to="/" className="text-primary hover:underline">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const initials = profile.username.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DevTrack</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-muted-foreground mb-4">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-foreground">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Journey */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Learning Journey</h2>
          {logsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No public logs yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {logs.map((log) => (
                <LogCard
                  key={log.id}
                  {...log}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  readOnly
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicProfile;
