"use client";

import { useEffect, useRef } from "react";

interface UseAutoScrollOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  smooth?: boolean;
}

export function useAutoScroll<T extends HTMLElement>(
  dependency: any,
  options: UseAutoScrollOptions = {},
) {
  const ref = useRef<T>(null);
  const { smooth = true } = options;

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;
      const scrollToBottom = () => {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      };

      // Small delay to ensure DOM has updated
      const timeoutId = setTimeout(scrollToBottom, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [dependency, smooth]);

  return ref;
}
