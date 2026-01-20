import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SessionsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Активные сессии</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Раздел сессий в разработке</p>
      </CardContent>
    </Card>
  );
}