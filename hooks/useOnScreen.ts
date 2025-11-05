import { useState, useEffect, useMemo } from 'react';
import type { RefObject } from 'react';

interface Options extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export function useOnScreen(ref: RefObject<Element>, options?: Options): boolean {
  const [isIntersecting, setIntersecting] = useState(false);
  const { triggerOnce = true, ...observerOptions } = options || {};

  const observer = useMemo(() => {
    // Using an instance property to avoid re-creating the observer on every render.
    // However, dependencies on options mean we need useMemo.
    return new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIntersecting(true);
        if (triggerOnce && ref.current) {
          // Disconnect after triggering once
          // Using a local variable for the observer to avoid stale closures.
          const currentObserver = observer;
          currentObserver.unobserve(ref.current);
        }
      } else if (!triggerOnce) {
        setIntersecting(false);
      }
    }, observerOptions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(observerOptions), triggerOnce, ref]); // Memoize based on options and ref

  useEffect(() => {
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, observer]);

  return isIntersecting;
}
