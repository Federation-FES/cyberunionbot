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
        "w-full p-3 rounded-xl border transition-all duration-300 text-left",
        "bg-gradient-to-br from-card to-muted/50",
        isSelected 
          ? "border-primary neon-glow" 
          : "border-border/50 hover:border-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-lg">Выберите количество часов</h3>
        </div>

        <div className="text-right">
          <span className="price-tag">{formatPrice(totalPrice)}</span>
          <p className="text-xs text-muted-foreground">{formatPrice(hourlyRate)}/час</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={hours <= minHours}
            className="h-10 w-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 group"
          >
            <Minus className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
          </Button>

          <div className="w-16 text-center">
            <span className="text-3xl font-bold text-primary">{hours}</span>
            <span className="text-sm text-muted-foreground ml-1">
              {hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            disabled={hours >= maxHours}
            className="h-10 w-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 group"
          >
            <Plus className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
          </Button>
        </div>

      </div>
    </button>
  );
}