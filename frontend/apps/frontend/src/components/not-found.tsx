"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NotFound({ children }: { children?: any }) {
  const router = useRouter();

  return (
    <div className="space-y-4 p-6 text-center">
      <div className="text-muted-foreground">
        {children || <p>The page you are looking for does not exist.</p>}
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="uppercase font-semibold text-sm"
        >
          Go back
        </Button>
        <Button asChild className="uppercase font-semibold text-sm">
          <Link href="/">Start Over</Link>
        </Button>
      </div>
    </div>
  );
}
