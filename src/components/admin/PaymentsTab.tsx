import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PaymentsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>История платежей</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Раздел платежей в разработке</p>
      </CardContent>
    </Card>
  );
}