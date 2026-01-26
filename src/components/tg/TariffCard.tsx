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
 <div
 onClick={onClick}
 className={cn(
 "gaming-card-hover p-4 cursor-pointer relative",
 isSelected && "border-primary neon-border"
 )}
 >
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h3 className="font-semibold text-lg mb-1">{name}</h3>
 {description && (
 <p className="text-sm text-muted-foreground mb-3">{description}</p>
 )}
 
 <div className="flex items-center gap-1 text-sm text-muted-foreground">
 <Clock className="h-4 w-4" style={{ color: '#2222E9' }} />
 {formatDuration(durationMinutes)}
 </div>
 </div>

 {/* Цена и ПАКЕТ справа в центре */}
 <div className="flex flex-col items-end justify-center gap-1">
 {isPackage && (
 <div className="px-2 py-1 bg-primary/20 text-white rounded text-xs font-semibold">
 ПАКЕТ
 </div>
 )}
 <span className="price-tag">{formatPrice(price)}</span>
 {!isPackage && durationMinutes >= 60 && (
 <span className="text-sm text-muted-foreground">
 {formatPrice(Math.round(price / (durationMinutes / 60)))}/час
 </span>
 )}
 </div>
 </div>
 </div>
 );
}
