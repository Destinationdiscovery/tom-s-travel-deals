import { useState, useRef } from "react";
import { X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface MultiTagInputProps {
  presets: string[];
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const MultiTagInput = ({ presets, value, onChange, placeholder = "Type or select..." }: MultiTagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const availablePresets = presets.filter((p) => !value.includes(p) && p.toLowerCase().includes(inputValue.toLowerCase()));

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-input bg-background min-h-[40px] cursor-text" onClick={() => setOpen(true)}>
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 text-xs">
            {tag}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputValue.trim()) { e.preventDefault(); addTag(inputValue); }
            if (e.key === "Backspace" && !inputValue && value.length > 0) removeTag(value[value.length - 1]!);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
        />
        <ChevronDown className="h-4 w-4 text-muted-foreground self-center shrink-0" />
      </div>

      {open && availablePresets.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
          {availablePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { addTag(preset); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiTagInput;
