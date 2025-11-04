import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Log } from "@/hooks/useLogs";
import { Profile } from "@/hooks/useProfile";
import { toast } from "sonner";

interface ExportDataProps {
  logs: Log[];
  profile: Profile | null;
}

const ExportData = ({ logs, profile }: ExportDataProps) => {
  const exportAsJSON = () => {
    try {
      const data = {
        profile: {
          username: profile?.username,
          display_name: profile?.display_name,
          bio: profile?.bio,
          public_mode: profile?.public_mode,
        },
        logs: logs.map((log) => ({
          title: log.title,
          content: log.content,
          date: log.date.toISOString().split("T")[0],
          tags: log.tags,
          created_at: log.createdAt.toISOString(),
        })),
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devtrack-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const exportAsCSV = () => {
    try {
      const headers = ["Date", "Title", "Content", "Tags"];
      const rows = logs.map((log) => [
        log.date.toISOString().split("T")[0],
        `"${log.title.replace(/"/g, '""')}"`,
        `"${log.content.replace(/"/g, '""')}"`,
        `"${log.tags.join(", ")}"`,
      ]);

      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devtrack-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Logs exported as CSV!");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={exportAsJSON} variant="outline" className="w-full justify-start">
        <Download className="mr-2 h-4 w-4" />
        Export All Data (JSON)
      </Button>
      <Button onClick={exportAsCSV} variant="outline" className="w-full justify-start">
        <Download className="mr-2 h-4 w-4" />
        Export Logs (CSV)
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        Export includes your profile information and all learning logs.
      </p>
    </div>
  );
};

export default ExportData;
