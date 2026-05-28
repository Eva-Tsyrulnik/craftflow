import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col items-center py-10 text-center">
        <p className="text-lg font-medium text-primary">Не удалось загрузить данные</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
        {onRetry ? (
          <Button type="button" variant="outline" className="mt-6" onClick={onRetry}>
            Повторить
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
