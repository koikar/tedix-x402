"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function DefaultCatchBoundary({ error, reset }: ErrorBoundaryProps) {
  const router = useRouter();

  console.error(error);

  return (
    <div className="min-w-0 flex-1 p-6 flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="size-16 text-destructive" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Something went wrong!</h2>
          <p className="text-muted-foreground max-w-md">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        <Button variant="outline" onClick={reset}>
          Try Again
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
