import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({ description, children }: EmptyStateProps) {
  return (
    <Card className="border-dashed bg-card/50">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-primary">Здесь пока ничего нет</p>
        {description ? (
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}
