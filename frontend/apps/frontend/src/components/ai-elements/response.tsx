import { type ComponentProps, memo } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type ResponseProps = Omit<ComponentProps<typeof ReactMarkdown>, "className"> & {
  className?: string;
};

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <div
      className={cn(
        "size-full prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          // Apply prose styling to all elements
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-lg font-semibold mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-sm font-semibold mb-1" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
          code: ({ node, ...props }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props} />
          ),
        }}
        {...props}
      />
    </div>
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

Response.displayName = "Response";
