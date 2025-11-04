import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { useLogs } from "@/hooks/useLogs";
import { useNavigate } from "react-router-dom";
import ProfileEditForm from "@/components/ProfileEditForm";
import ExportData from "@/components/ExportData";
import { useState } from "react";

const Profile = () => {
  const { profile, isLoading } = useProfile();
  const { logs } = useLogs();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("view");

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
            <div className="p-6 max-w-2xl mx-auto">
              <Skeleton className="h-64 w-full" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const initials = profile?.username?.substring(0, 2).toUpperCase() || "DT";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold">Profile</h1>
            </div>
          </header>

          <div className="p-6 max-w-3xl mx-auto space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="view">Overview</TabsTrigger>
                <TabsTrigger value="edit">Edit Profile</TabsTrigger>
                <TabsTrigger value="export">Export Data</TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {profile?.display_name || profile?.username}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          @{profile?.username}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Bio</label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile?.bio || "No bio yet"}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Total Logs</label>
                        <p className="text-2xl font-bold">{logs.length}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-sm font-medium">Public Profile</span>
                          <p className="text-xs text-muted-foreground">
                            {profile?.public_mode ? "Visible to everyone" : "Private"}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/${profile?.username}`)}
                          disabled={!profile?.public_mode}
                        >
                          View Public Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="edit" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile && (
                      <ProfileEditForm
                        profile={profile}
                        onSuccess={() => setActiveTab("view")}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="export" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Your Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExportData logs={logs} profile={profile} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
