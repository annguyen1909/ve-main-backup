import { useEffect, useState, useRef } from "react";

/**
 * useCheckpointObserver
 * Theo dõi các element (checkpoint) và trả về trạng thái visible của từng checkpoint.
 * @param count Số lượng checkpoint cần theo dõi
 * @param options IntersectionObserverInit (tùy chọn)
 * @returns [visibleItems, itemRefs]
 */
export function useCheckpointObserver(count: number, options?: IntersectionObserverInit): [boolean[], React.MutableRefObject<(HTMLDivElement | null)[]>] {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(count).fill(false));
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => {
                const newVisible = [...prev];
                newVisible[index] = true;
                return newVisible;
              });
            }
          });
        },
        options || {
          threshold: 0.5,
          rootMargin: "0px 0px -200px 0px"
        }
      );
      observer.observe(ref);
      return observer;
    });
    return () => {
      observers.forEach((observer, index) => {
        if (observer && itemRefs.current[index]) {
          observer.unobserve(itemRefs.current[index]!);
        }
      });
    };
  }, [count, options]);

  return [visibleItems, itemRefs];
}