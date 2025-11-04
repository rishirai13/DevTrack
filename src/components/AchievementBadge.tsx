import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementBadgeProps {
  name: string;
  description: string;
}

const AchievementBadge = ({ name, description }: AchievementBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="cursor-pointer transition-all hover:scale-105 hover:border-primary/50">
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <Award className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium text-center">{name}</p>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementBadge;
