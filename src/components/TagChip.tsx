import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagChipProps {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
  variant?: "default" | "secondary" | "outline";
}

const TagChip = ({ label, onRemove, onClick, variant = "secondary" }: TagChipProps) => {
  return (
    <Badge
      variant={variant}
      className="cursor-pointer transition-all hover:shadow-sm"
      onClick={onClick}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full hover:bg-background/20"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
};

export default TagChip;
