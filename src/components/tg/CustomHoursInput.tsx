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
 <div
 onClick={onSelect}
 className={cn(
 "gaming-card-hover cursor-pointer",
 isSelected && "border-primary neon-border"
 )}
 style={{ paddingTop: '4px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '16px' }}
 >
 <div className="flex items-center justify-between" style={{ marginBottom: '2px' }}>
 <div className="flex items-center gap-4">
 {/* Иконка часов */}
 <Clock className="h-5 w-5 flex-shrink-0" style={{ color: '#2222E9' }} />
 
 {/* Заголовок */}
 <h3 className="font-semibold text-lg">Выберите количество часов</h3>
 </div>

 {/* Цена справа */}
 <div className="text-right">
 <div className="price-tag">{formatPrice(totalPrice)}</div>
 <div className="text-sm text-muted-foreground">{formatPrice(hourlyRate)}/час</div>
 </div>
 </div>

 {/* Переключатели слева - компактнее */}
 <div className="flex items-center gap-0.5">
 <Button
 type="button"
 onClick={handleDecrement}
 disabled={hours <= minHours}
 variant="outline"
 size="icon"
 className="h-10 w-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 group"
 >
 <Minus className="h-4 w-4 group-hover:text-primary" />
 </Button>

 <div className="text-center min-w-[80px]">
 <div className="text-2xl font-bold">{hours}</div>
 <div className="text-sm text-muted-foreground">
 {hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}
 </div>
 </div>

 <Button
 type="button"
 onClick={handleIncrement}
 disabled={hours >= maxHours}
 variant="outline"
 size="icon"
 className="h-10 w-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 group"
 >
 <Plus className="h-4 w-4 group-hover:text-primary" />
 </Button>
 </div>
 </div>
 );
}
