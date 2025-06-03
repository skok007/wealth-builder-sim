
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface TickerInputProps {
  ticker: { symbol: string; weight: number };
  onUpdate: (updates: Partial<{ symbol: string; weight: number }>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const TickerInput = ({ ticker, onUpdate, onRemove, canRemove }: TickerInputProps) => {
  return (
    <div className="flex gap-2 items-center">
      <Input
        placeholder="AAPL"
        value={ticker.symbol}
        onChange={(e) => onUpdate({ symbol: e.target.value.toUpperCase() })}
        className="flex-1"
      />
      <div className="flex items-center gap-1">
        <Input
          type="number"
          placeholder="25"
          value={ticker.weight || ""}
          onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
          className="w-20"
          min="0"
          max="100"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
      {canRemove && (
        <Button
          variant="outline"
          size="icon"
          onClick={onRemove}
          className="h-9 w-9 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
