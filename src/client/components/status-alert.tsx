import { Alert, AlertDescription, AlertTitle } from "@/client/components/ui/alert";

type StatusAlertProps = {
  title: string;
  description: React.ReactNode;
  tone?: "default" | "success" | "destructive";
};

export function StatusAlert({ title, description, tone = "default" }: StatusAlertProps) {
  return (
    <Alert variant={tone}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
