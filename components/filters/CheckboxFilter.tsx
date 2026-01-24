"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type CheckboxFilterProps = {
  options: Array<{
    value: string;
    label: string;
    count?: number;
  }>;
  selected: string[];
  onChange: (selected: string[]) => void;
};

/**
 * Filtro de checkbox múltipla seleção
 * Usado para marcas, sockets, etc.
 */
export function CheckboxFilter({
  options,
  selected,
  onChange,
}: CheckboxFilterProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
          />
          <Label
            htmlFor={option.value}
            className="flex flex-1 cursor-pointer items-center justify-between text-sm font-normal"
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span className="text-xs text-muted-foreground">
                ({option.count})
              </span>
            )}
          </Label>
        </div>
      ))}
    </div>
  );
}