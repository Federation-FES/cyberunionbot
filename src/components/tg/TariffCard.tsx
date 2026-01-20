import { Clock, Zap, Star } from 'lucide-react';
import { formatPrice, formatDuration } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface TariffCardProps {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  type: 'hourly' | 'package';
  isSelected?: boolean;
  onClick?: () => void;
}

export function TariffCard({
  name,
  description,
  price,
  durationMinutes,
  type,
  isSelected,
  onClick,
}: TariffCardProps) {
  const isPackage = type === 'package';

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl border transition-all duration-300 text-left",
        "bg-card hover:border-primary/50",
        isSelected 
          ? "border-primary neon-glow" 
          : "border-border/50 hover:bg-card/80",
        isPackage && "relative overflow-hidden"
      )}
    >
      {isPackage && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-neon-pink px-3 py-1 text-xs font-bold rounded-bl-lg">
          <Star className="inline-block w-3 h-3 mr-1" />
          ПАКЕТ
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-bold text-lg",
            isSelected && "text-primary"
          )}>
            {name}
          </h3>
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-secondary" />
            <span>{formatDuration(durationMinutes)}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="price-tag">{formatPrice(price)}</span>
          {!isPackage && durationMinutes >= 60 && (
            <span className="text-xs text-muted-foreground">
              {formatPrice(Math.round(price / (durationMinutes / 60)))}/час
            </span>
          )}
        </div>
      </div>
      
      {isSelected && (
        <div className="mt-3 flex items-center gap-2 text-sm text-primary">
          <Zap className="w-4 h-4" />
          <span>Выбрано</span>
        </div>
      )}
    </button>
  );
}