"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { dateAwareHref } from "@/lib/nav";

const SWIPEABLE_TABS = ["/", "/tech", "/politics"];
const SWIPE_THRESHOLD = 60;

export function useSwipeNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const date = searchParams.get("date");
    let startX = 0;

    function onTouchStart(event: TouchEvent) {
      startX = event.touches[0]!.clientX;
    }

    function onTouchEnd(event: TouchEvent) {
      const deltaX = event.changedTouches[0]!.clientX - startX;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

      const currentIndex = SWIPEABLE_TABS.indexOf(pathname);
      if (currentIndex === -1) return;

      if (deltaX < 0 && currentIndex < SWIPEABLE_TABS.length - 1) {
        router.push(dateAwareHref(SWIPEABLE_TABS[currentIndex + 1]!, date));
      } else if (deltaX > 0 && currentIndex > 0) {
        router.push(dateAwareHref(SWIPEABLE_TABS[currentIndex - 1]!, date));
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [router, pathname, searchParams]);
}
