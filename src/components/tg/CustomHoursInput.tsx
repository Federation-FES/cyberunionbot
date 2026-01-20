import { Minus, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface CustomHoursInputProps {
  hours: number;
  onHoursChange: (hours: number) => void;
  hourlyRate: number; // in kopecks
  minHours?: number;
  maxHours?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function CustomHoursInput({
  hours,
  onHoursChange,
  hourlyRate,
  minHours = 1,
  maxHours = 12,
  isSelected,
  onSelect,
}: CustomHoursInputProps) {
  const totalPrice = hours * hourlyRate;

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hours > minHours) {
      onHoursChange(hours - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hours < maxHours) {
      onHoursChange(hours + 1);
    }
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full p-4 rounded-xl border transition-all duration-300 text-left",
        "bg-gradient-to-br from-card to-muted/50",
        isSelected 
          ? "border-secondary neon-glow" 
          : "border-border/50 hover:border-secondary/50"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
          <Clock className="w-4 h-4 text-secondary" />
        </div>
        <h3 className="font-bold text-lg">Свой вариант</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Выберите количество часов
      </p>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={hours <= minHours}
            className="h-10 w-10 rounded-full border-border/50 hover:border-secondary hover:bg-secondary/10"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <div className="w-16 text-center">
            <span className="text-3xl font-bold text-secondary">{hours}</span>
            <span className="text-sm text-muted-foreground ml-1">
              {hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            disabled={hours >= maxHours}
            className="h-10 w-10 rounded-full border-border/50 hover:border-secondary hover:bg-secondary/10"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-right">
          <span className="price-tag">{formatPrice(totalPrice)}</span>
          <p className="text-xs text-muted-foreground">{formatPrice(hourlyRate)}/час</p>
        </div>
      </div>
    </button>
  );
}