import { Button } from "@/components/ui/button";
import { MoveLeft, Home } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface ErrorViewProps {
  statusCode?: string | number;
  title: string;
  message: string;
}

export function ErrorView({ statusCode, title, message }: ErrorViewProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {statusCode && (
        <h1 className="text-9xl font-extrabold text-primary/20 tracking-tighter sm:text-[12rem]">
          {statusCode}
        </h1>
      )}
      <div className={statusCode ? "-mt-8 sm:-mt-12" : ""}>
        <h2 className="text-2xl font-bold tracking-tight sm:text-4xl text-foreground">
          {title}
        </h2>
        <p className="mt-4 text-muted-foreground max-w-[500px] mx-auto text-lg leading-relaxed">
          {message}
        </p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => window.history.back()}
          className="gap-2 transition-all hover:translate-x-[-4px]"
        >
          <MoveLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Button
          size="lg"
          onClick={() => navigate({ to: "/" })}
          className="gap-2 transition-all hover:translate-y-[-4px] shadow-lg hover:shadow-primary/20"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
