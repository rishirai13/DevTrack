import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TagChip from "./TagChip";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

const TagInput = ({ tags, onChange, suggestions = [] }: TagInputProps) => {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    (tag) =>
      tag.toLowerCase().includes(input.toLowerCase()) &&
      !tags.includes(tag)
  );

  const handleAddTag = (tag?: string) => {
    const tagToAdd = tag || input.trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      onChange([...tags, tagToAdd]);
      setInput("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  useEffect(() => {
    if (input) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              placeholder="e.g., React, TypeScript, DSA"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              onFocus={() => input && setShowSuggestions(true)}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full">
                <Command className="rounded-lg border shadow-md">
                  <CommandList>
                    <CommandGroup>
                      {filteredSuggestions.map((tag) => (
                        <CommandItem
                          key={tag}
                          onSelect={() => handleAddTag(tag)}
                          className="cursor-pointer"
                        >
                          {tag}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
          <Button type="button" onClick={() => handleAddTag()} variant="secondary">
            Add
          </Button>
        </div>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip key={tag} label={tag} onRemove={() => handleRemoveTag(tag)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
