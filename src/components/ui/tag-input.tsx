import * as React from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Suggested categories for the blog
const SUGGESTED_CATEGORIES = [
  "Isenção Fiscal",
  "Direito Tributário",
  "Direito do Trabalho",
  "Previdenciário",
  "Empresarial",
  "Contratos",
  "Dívidas",
  "FGTS",
  "Aposentadoria",
  "HIV/AIDS",
  "Doenças Graves",
];

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Adicionar categoria...",
  className,
  maxTags = 5,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Filter suggestions based on input and already selected tags
  const filteredSuggestions = SUGGESTED_CATEGORIES.filter(
    (cat) =>
      !value.includes(cat) &&
      cat.toLowerCase().includes(inputValue.toLowerCase())
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedTag]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Tags display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="px-2 py-1 text-sm bg-accent/20 text-accent-foreground hover:bg-accent/30 transition-colors"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1.5 hover:text-destructive transition-colors"
              aria-label={`Remover ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Input field */}
      {value.length < maxTags && (
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : "Adicionar mais..."}
            className="bg-background"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && (inputValue || filteredSuggestions.length > 0) && (
            <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {/* Custom input option */}
              {inputValue.trim() && !filteredSuggestions.includes(inputValue.trim()) && (
                <button
                  type="button"
                  onClick={() => addTag(inputValue)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent/10 flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4 text-accent" />
                  <span>Criar "{inputValue.trim()}"</span>
                </button>
              )}

              {/* Suggested categories */}
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent/10 transition-colors"
                >
                  {suggestion}
                </button>
              ))}

              {/* Empty state */}
              {!inputValue.trim() && filteredSuggestions.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Todas as categorias já foram adicionadas
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Max tags indicator */}
      <p className="text-xs text-muted-foreground mt-1.5">
        {value.length}/{maxTags} categorias
      </p>
    </div>
  );
}
