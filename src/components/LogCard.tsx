import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import TagChip from "./TagChip";
import { memo } from "react";

interface LogCardProps {
  id: string;
  title: string;
  content: string;
  tags: string[];
  date: Date;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

const LogCard = ({ id, title, content, tags, date, onEdit, onDelete, readOnly = false }: LogCardProps) => {
  return (
    <Card className="group transition-all hover:shadow-lg hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          {!readOnly && (
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit?.(id)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete?.(id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-0">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(date, "MMM dd, yyyy")}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

// Memoize LogCard to prevent unnecessary re-renders
export default memo(LogCard);
