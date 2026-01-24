"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { formatBRLFromCents } from "@/lib/money";

type PriceRangeFilterProps = {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
};

/**
 * Filtro de range de preço com slider e inputs
 */
export function PriceRangeFilter({
  min,
  max,
  value,
  onChange,
}: PriceRangeFilterProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    const range: [number, number] = [newValue[0], newValue[1]];
    setLocalValue(range);
    onChange(range);
  };

  return (
    <div className="space-y-4">
      {/* Slider */}
      <Slider
        min={min}
        max={max}
        step={1000} // Passos de R$ 10
        value={localValue}
        onValueChange={handleSliderChange}
        className="w-full"
      />

      {/* Inputs de Min/Max */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Mínimo</div>
          <div className="mt-1 text-sm font-medium">
            {formatBRLFromCents(localValue[0])}
          </div>
        </div>
        <span className="text-muted-foreground">—</span>
        <div className="flex-1 text-right">
          <div className="text-xs text-muted-foreground">Máximo</div>
          <div className="mt-1 text-sm font-medium">
            {formatBRLFromCents(localValue[1])}
          </div>
        </div>
      </div>
    </div>
  );
}