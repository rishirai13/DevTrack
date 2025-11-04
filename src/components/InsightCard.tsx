import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode, memo } from "react";

interface InsightCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const InsightCard = ({ title, icon: Icon, children, trend }: InsightCardProps) => {
  return (
    <Card className="transition-all hover:shadow-lg hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {children}
          {trend && (
            <p
              className={cn(
                "text-xs",
                trend.isPositive ? "text-accent" : "text-muted-foreground"
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Memoize InsightCard to prevent unnecessary re-renders
export default memo(InsightCard);
