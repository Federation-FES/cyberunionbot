import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ComputersTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление компьютерами</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Раздел компьютеров в разработке</p>
      </CardContent>
    </Card>
  );
}